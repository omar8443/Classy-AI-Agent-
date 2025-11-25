import { NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"

interface ServiceStatus {
  name: string
  status: "operational" | "degraded" | "down"
  latency?: number
  lastCheck: Date
  message?: string
}

async function checkFirebase(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const { db } = getFirebaseAdmin()
    await db.collection("_health_check").limit(1).get()
    
    return {
      name: "Firebase",
      status: "operational",
      latency: Date.now() - start,
      lastCheck: new Date(),
      message: "Connected to Firestore",
    }
  } catch (error) {
    return {
      name: "Firebase",
      status: "down",
      lastCheck: new Date(),
      message: error instanceof Error ? error.message : "Connection failed",
    }
  }
}

async function checkOpenAI(): Promise<ServiceStatus> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return {
      name: "OpenAI",
      status: "down",
      lastCheck: new Date(),
      message: "API key not configured",
    }
  }

  return {
    name: "OpenAI",
    status: "operational",
    lastCheck: new Date(),
    message: "API key configured",
  }
}

async function checkElevenLabs(): Promise<ServiceStatus> {
  const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    return {
      name: "ElevenLabs",
      status: "degraded",
      lastCheck: new Date(),
      message: "Webhook secret not configured",
    }
  }

  return {
    name: "ElevenLabs",
    status: "operational",
    lastCheck: new Date(),
    message: "Webhook configured",
  }
}

export async function GET() {
  try {
    const [firebase, openai, elevenlabs] = await Promise.all([
      checkFirebase(),
      checkOpenAI(),
      checkElevenLabs(),
    ])

    return NextResponse.json({
      services: [firebase, openai, elevenlabs],
      checkedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

