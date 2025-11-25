import { NextRequest, NextResponse } from "next/server"
import { updateLastLogin } from "@/lib/firestore/users"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await updateLastLogin(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating last login:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

