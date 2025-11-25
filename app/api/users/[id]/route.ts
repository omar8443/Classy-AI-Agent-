import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { getUserById, updateUser, createUserDocument } from "@/lib/firestore/users"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserById(params.id)

    if (!user) {
      // Try to get user from Firebase Auth and create document
      try {
        const { auth } = getFirebaseAdmin()
        const authUser = await auth.getUser(params.id)
        
        // Create user document with default settings
        await createUserDocument(
          params.id,
          authUser.email || "unknown@example.com",
          authUser.displayName || "Unknown User",
          "agent" // Default role
        )
        
        // Fetch the newly created user
        const newUser = await getUserById(params.id)
        if (newUser) {
          return NextResponse.json(newUser)
        }
      } catch (createError) {
        console.error("Error auto-creating user document:", createError)
      }
      
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    await updateUser(params.id, body)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

