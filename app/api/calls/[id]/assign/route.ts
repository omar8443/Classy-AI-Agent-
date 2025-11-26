import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { getUserById } from "@/lib/firestore/users"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const callId = params.id
    const body = await request.json()
    const { userId, notes, status, currentUserId, currentUserRole } = body

    const { db } = getFirebaseAdmin()
    
    // Check permissions: only admins can assign to anyone
    // Non-admins can only assign to themselves
    if (currentUserRole !== "admin" && userId !== currentUserId) {
      return NextResponse.json(
        { ok: false, error: "You can only assign calls to yourself" },
        { status: 403 }
      )
    }

    const callRef = db.collection("calls").doc(callId)
    const callDoc = await callRef.get()

    if (!callDoc.exists) {
      return NextResponse.json(
        { ok: false, error: "Call not found" },
        { status: 404 }
      )
    }

    // Get user details if userId is provided
    let assignedToName: string | null = null
    if (userId) {
      const user = await getUserById(userId)
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "User not found" },
          { status: 404 }
        )
      }
      assignedToName = user.name
    }

    // Update call document
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (userId !== undefined) {
      updateData.assignedTo = userId
      updateData.assignedToName = assignedToName
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    if (status !== undefined) {
      updateData.status = status
    }

    await callRef.update(updateData)

    return NextResponse.json({ 
      ok: true,
      data: {
        assignedTo: userId || null,
        assignedToName,
        notes: notes || null,
        status: status || null,
      }
    })
  } catch (error) {
    console.error("Error assigning call:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

