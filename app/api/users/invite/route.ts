import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { createUserDocument } from "@/lib/firestore/users"
import { UserRole } from "@/types/users"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password, phone, role } = body

    if (!email || !name || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { auth } = getFirebaseAdmin()

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone || undefined,
    })

    // Create user document in Firestore with permissions
    await createUserDocument(userRecord.uid, email, name, role as UserRole || "agent")

    return NextResponse.json({ 
      ok: true, 
      userId: userRecord.uid 
    })
  } catch (error) {
    console.error("Error inviting user:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

