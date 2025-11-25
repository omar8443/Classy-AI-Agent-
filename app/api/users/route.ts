import { NextRequest, NextResponse } from "next/server"
import { getUsers } from "@/lib/firestore/users"

/**
 * Get all users - useful for assigning calls
 */
export async function GET(request: NextRequest) {
  try {
    const users = await getUsers()
    return NextResponse.json({ ok: true, users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
