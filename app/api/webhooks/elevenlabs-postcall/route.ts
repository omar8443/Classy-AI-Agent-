import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { summarizeCall } from "@/lib/summarizeCall"
import {
  ElevenLabsPostCallPayload,
  ElevenLabsPostCallPayloadSchema,
} from "@/types/webhooks"
import { LeadSchema } from "@/types/leads"
import { CallSchema } from "@/types/calls"
import crypto from "crypto"

const stringifyRawPayload = (value: unknown) => {
  try {
    return JSON.stringify(value)
  } catch (error) {
    console.warn("⚠️ Unable to stringify raw payload, storing fallback message.", error)
    return JSON.stringify({ error: "Failed to stringify raw webhook payload" })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body text for HMAC verification
    const bodyText = await request.text()
    
    // Verify webhook secret with HMAC if configured
    const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get("x-elevenlabs-signature")
      if (!signature) {
        console.error("Missing webhook signature")
        return NextResponse.json(
          { ok: false, error: "Unauthorized" },
          { status: 401 }
        )
      }

      // Parse signature header format: "t=timestamp,v0=hash"
      const parts = signature.split(",")
      const timestampPart = parts.find((p) => p.startsWith("t="))
      const signaturePart = parts.find((p) => p.startsWith("v0="))

      if (!timestampPart || !signaturePart) {
        console.error("Invalid signature format")
        return NextResponse.json(
          { ok: false, error: "Invalid signature format" },
          { status: 401 }
        )
      }

      const timestamp = timestampPart.split("=")[1]
      const receivedSignature = signaturePart.split("=")[1]

      // Validate timestamp (prevent replay attacks - 30 minutes tolerance)
      const tolerance = 30 * 60 // 30 minutes in seconds
      const currentTime = Math.floor(Date.now() / 1000)
      if (Math.abs(currentTime - parseInt(timestamp, 10)) > tolerance) {
        console.error("Timestamp outside tolerance window")
        return NextResponse.json(
          { ok: false, error: "Request timestamp too old" },
          { status: 401 }
        )
      }

      // Calculate HMAC signature: timestamp.body
      const payload = `${timestamp}.${bodyText}`
      const hmac = crypto.createHmac("sha256", webhookSecret)
      hmac.update(payload)
      const calculatedSignature = hmac.digest("hex")

      if (calculatedSignature !== receivedSignature) {
        console.error("Signature verification failed")
        return NextResponse.json(
          { ok: false, error: "Invalid signature" },
          { status: 401 }
        )
      }

      console.log("✅ Webhook signature verified successfully")
    }

    // Parse and validate payload
    const body = JSON.parse(bodyText)
    
    // Log the raw payload for debugging
    console.log("📥 Received ElevenLabs webhook payload:", JSON.stringify(body, null, 2))
    
    const validationResult = ElevenLabsPostCallPayloadSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("❌ Invalid payload:", validationResult.error)
      console.error("📋 Raw body received:", JSON.stringify(body, null, 2))
      return NextResponse.json(
        { ok: false, error: "Invalid payload", details: validationResult.error },
        { status: 400 }
      )
    }

    const rawPayload: ElevenLabsPostCallPayload = validationResult.data
    const rawPayloadSerialized = stringifyRawPayload(body)
    
    // Extract data from nested ElevenLabs structure
    const eventData = (body as any).data || body
    const metadata = eventData.metadata || {}
    const phoneCall = metadata.phone_call || {}
    const analysis = eventData.analysis || {}
    const dataCollection = analysis.data_collection_results || {}
    
    // Extract phone number from multiple possible locations
    const phoneNumber = 
      phoneCall.external_number || // ElevenLabs: +15145132710
      dataCollection.client_phone?.value || // ElevenLabs data collection: 5145132710
      rawPayload.caller_phone_number || 
      rawPayload.callerPhoneNumber || 
      rawPayload.phone_number || 
      rawPayload.phoneNumber || 
      rawPayload.from || 
      "unknown"
    
    // Extract caller name from multiple possible locations
    const callerName = 
      dataCollection.client_name?.value || // ElevenLabs data collection: "Omar Ali"
      rawPayload.caller_name || 
      rawPayload.callerName || 
      rawPayload.name || 
      null
    
    // Extract conversation/call ID
    const callId = 
      eventData.conversation_id || // ElevenLabs: conv_xxx
      phoneCall.call_sid || // Twilio SID
      rawPayload.call_id || 
      rawPayload.callId || 
      rawPayload.id || 
      `call_${Date.now()}`
    
    // Extract transcript - ElevenLabs uses array format
    let transcriptData = eventData.transcript || rawPayload.transcript
    
    // Extract timestamp
    const timestamp = 
      (body as any).event_timestamp || 
      metadata.start_time_unix_secs ||
      rawPayload.timestamp || 
      rawPayload.created_at || 
      rawPayload.createdAt || 
      Date.now()
    
    // Extract duration
    const duration = 
      metadata.call_duration_secs ||
      rawPayload.duration || 
      rawPayload.durationSeconds
    
    // Normalize field names to handle different formats
    const payload = {
      call_id: callId,
      timestamp: timestamp,
      caller_phone_number: phoneNumber,
      caller_name: callerName,
      transcript: transcriptData,
      audio_url: rawPayload.audio_url || rawPayload.audioUrl || rawPayload.recording_url || rawPayload.recordingUrl || null,
      duration: duration,
      agent_id: eventData.agent_id || rawPayload.agent_id || rawPayload.agentId,
      metadata: metadata,
    }
    
    console.log("✅ Normalized payload:", JSON.stringify(payload, null, 2))
    
    // Validate we have minimum required data
    if (!payload.call_id) {
      console.error("❌ Missing call_id after normalization")
      return NextResponse.json(
        { ok: false, error: "Missing required field: call_id" },
        { status: 400 }
      )
    }
    
    if (!payload.caller_phone_number || payload.caller_phone_number === "unknown") {
      console.warn("⚠️ Missing caller phone number, using placeholder")
    }

    // Get Firestore instance
    const { db } = getFirebaseAdmin()

    // Check if call already exists (idempotency)
    const existingCallRef = db.collection("calls").doc(payload.call_id)
    const existingCall = await existingCallRef.get()

    if (existingCall.exists) {
      console.log(`Call ${payload.call_id} already processed`)
      return NextResponse.json({ ok: true, message: "Call already processed" })
    }

    // Process transcript - ElevenLabs format: array of {role, message}
    let transcript = ""
    if (payload.transcript) {
      if (typeof payload.transcript === "string") {
        transcript = payload.transcript
      } else if (Array.isArray(payload.transcript)) {
        if (payload.transcript.length > 0) {
          const firstItem = payload.transcript[0]
          
          // ElevenLabs format: {role: "agent"|"user", message: "..."}
          if (typeof firstItem === "object" && "role" in firstItem && "message" in firstItem) {
            transcript = (payload.transcript as Array<{ role: string; message: string | null }>)
              .filter((seg) => seg.message) // Filter out null messages (tool calls, etc.)
              .map((seg) => `${seg.role === "agent" ? "Agent" : "User"}: ${seg.message}`)
              .join("\n")
          }
          // Generic format: {speaker, text}
          else if (typeof firstItem === "object" && "speaker" in firstItem && "text" in firstItem) {
            transcript = (payload.transcript as Array<{ speaker: string; text: string }>)
              .map((seg) => `${seg.speaker}: ${seg.text}`)
              .join("\n")
          }
          // Array of strings
          else if (typeof firstItem === "string") {
            transcript = (payload.transcript as string[]).join(" ")
          }
        }
      }
    }

    // Generate summary (optional, uses OpenAI if configured)
    const { summary } = await summarizeCall(transcript)

    // Calculate duration
    let durationSeconds: number | null = null
    if (payload.duration) {
      durationSeconds = payload.duration
    }

    // Extract email from ElevenLabs data collection if available
    const clientEmail = dataCollection.client_email?.value || null
    
    // Find or create lead
    let leadId: string | null = null
    const leadsQuery = await db
      .collection("leads")
      .where("phoneNumber", "==", payload.caller_phone_number)
      .limit(1)
      .get()

    if (!leadsQuery.empty) {
      // Update existing lead
      const leadDoc = leadsQuery.docs[0]
      leadId = leadDoc.id
      const leadData = leadDoc.data()
      const currentTotalCalls = leadData.totalCalls || 0

      const updateData: any = {
        updatedAt: new Date(),
        lastCallId: payload.call_id,
        totalCalls: currentTotalCalls + 1,
      }
      
      // Update name if we have it and lead doesn't
      if (payload.caller_name && !leadData.name) {
        updateData.name = payload.caller_name
      }
      
      // Update email if we have it and lead doesn't
      if (clientEmail && !leadData.email) {
        updateData.email = clientEmail
      }

      await leadDoc.ref.update(updateData)
    } else {
      // Create new lead
      const newLeadData = LeadSchema.parse({
        phoneNumber: payload.caller_phone_number,
        name: payload.caller_name || null,
        email: clientEmail || null,
        source: "elevenlabs_voice_agent",
        status: "new",
        tags: [],
        notes: null,
        lastCallId: payload.call_id,
        totalCalls: 1,
      })

      const newLeadRef = db.collection("leads").doc()
      leadId = newLeadRef.id
      await newLeadRef.set({
        ...newLeadData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Create call document
    const callData = CallSchema.parse({
      leadId,
      direction: null, // ElevenLabs may not provide this
      callerPhoneNumber: payload.caller_phone_number,
      callerName: payload.caller_name || null,
      provider: "elevenlabs",
      rawPayload: rawPayloadSerialized,
      transcript,
      summary,
      durationSeconds,
      audioUrl: payload.audio_url || null,
      labels: [],
      assignedTo: null, // Will be assigned by admin/agent
      assignedToName: null,
      notes: null,
      status: "pending", // New calls start as pending
    })

    // Calculate end time based on timestamp and duration
    let endedAt: Date | null = null
    if (payload.duration && payload.timestamp) {
      try {
        const timestampMs = typeof payload.timestamp === "number"
          ? payload.timestamp * 1000
          : new Date(payload.timestamp).getTime()
        endedAt = new Date(timestampMs + payload.duration * 1000)
      } catch (error) {
        console.warn("⚠️ Could not calculate endedAt:", error)
      }
    }

    await existingCallRef.set({
      ...callData,
      createdAt: new Date(),
      endedAt,
    })

    console.log(`✅ Successfully processed call ${payload.call_id} for lead ${leadId}`)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "ElevenLabs webhook endpoint" })
}

