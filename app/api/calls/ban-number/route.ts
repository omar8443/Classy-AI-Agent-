import { NextRequest, NextResponse } from "next/server"
import { banNumber } from "@/lib/firestore/banned-numbers"
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, reason, callId } = body

    if (!phoneNumber || !reason) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get current user from request (you might want to add auth middleware)
    // For now, we'll use a placeholder
    const userId = "system"
    const userName = "System"

    await banNumber(phoneNumber, reason, userId, userName)

    // Optionally archive the call
    if (callId) {
      const { db } = getFirebaseAdmin()
      await db.collection("calls").doc(callId).update({
        archived: true,
        labels: ["banned"],
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error banning number:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

