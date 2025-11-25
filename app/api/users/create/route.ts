import { NextRequest, NextResponse } from "next/server"
import { createUserDocument } from "@/lib/firestore/users"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name, role } = body

    if (!userId || !email || !name) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    await createUserDocument(userId, email, name, role || "agent")

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error creating user document:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

