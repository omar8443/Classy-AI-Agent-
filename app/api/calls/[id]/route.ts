import { NextRequest, NextResponse } from "next/server"

import { getFirebaseAdmin } from "@/lib/firebaseAdmin"

const ALLOWED_STATUSES = ["pending", "in_progress", "completed", "follow_up"]

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { db } = getFirebaseAdmin()

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    }
    let hasChanges = false

    if (body.archived !== undefined) {
      updates.archived = Boolean(body.archived)
      hasChanges = true
    }

    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 })
      }
      updates.status = body.status
      hasChanges = true
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes || null
      hasChanges = true
    }

    if (body.assignedTo !== undefined) {
      updates.assignedTo = body.assignedTo || null
      hasChanges = true
    }

    if (body.assignedToName !== undefined) {
      updates.assignedToName = body.assignedToName || null
      hasChanges = true
    }

    if (!hasChanges) {
      return NextResponse.json({ ok: false, error: "No valid updates provided" }, { status: 400 })
    }

    await db.collection("calls").doc(params.id).update(updates)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating call:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = getFirebaseAdmin()
    await db.collection("calls").doc(params.id).delete()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting call:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}


