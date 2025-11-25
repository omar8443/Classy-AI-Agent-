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
    
    // Normalize field names to handle different formats
    const payload = {
      call_id: rawPayload.call_id || rawPayload.callId || rawPayload.id || `call_${Date.now()}`,
      timestamp: rawPayload.timestamp || rawPayload.created_at || rawPayload.createdAt || Date.now(),
      caller_phone_number: rawPayload.caller_phone_number || rawPayload.callerPhoneNumber || 
                          rawPayload.phone_number || rawPayload.phoneNumber || rawPayload.from || "unknown",
      caller_name: rawPayload.caller_name || rawPayload.callerName || rawPayload.name || null,
      transcript: rawPayload.transcript,
      audio_url: rawPayload.audio_url || rawPayload.audioUrl || rawPayload.recording_url || rawPayload.recordingUrl || null,
      duration: rawPayload.duration || rawPayload.durationSeconds,
      agent_id: rawPayload.agent_id || rawPayload.agentId,
      metadata: rawPayload.metadata,
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

    // Process transcript
    let transcript = ""
    if (payload.transcript) {
      if (typeof payload.transcript === "string") {
        transcript = payload.transcript
      } else if (Array.isArray(payload.transcript)) {
        if (payload.transcript.length > 0) {
          if (typeof payload.transcript[0] === "string") {
            transcript = (payload.transcript as string[]).join(" ")
          } else {
            // Array of objects with speaker/text
            transcript = (payload.transcript as Array<{ speaker: string; text: string }>)
              .map((seg) => `${seg.speaker}: ${seg.text}`)
              .join("\n")
          }
        }
      }
    }

    // Generate summary (optional, uses OpenAI if configured)
    const { summary, sentiment } = await summarizeCall(transcript)

    // Calculate duration
    let durationSeconds: number | null = null
    if (payload.duration) {
      durationSeconds = payload.duration
    }

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

      await leadDoc.ref.update({
        updatedAt: new Date(),
        lastCallId: payload.call_id,
        totalCalls: currentTotalCalls + 1,
        ...(payload.caller_name && !leadData.name
          ? { name: payload.caller_name }
          : {}),
      })
    } else {
      // Create new lead
      const newLeadData = LeadSchema.parse({
        phoneNumber: payload.caller_phone_number,
        name: payload.caller_name || null,
        email: null,
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
      rawPayload: body,
      transcript,
      summary,
      sentiment,
      durationSeconds,
      audioUrl: payload.audio_url || null,
      labels: [],
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

