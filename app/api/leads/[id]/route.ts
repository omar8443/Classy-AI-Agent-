import { NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { LeadStatus } from "@/types/leads"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { db } = getFirebaseAdmin()

    const updates: any = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) {
      updates.name = body.name || null
    }
    if (body.email !== undefined) {
      updates.email = body.email || null
    }
    if (body.status !== undefined) {
      if (!["new", "in_progress", "booked", "closed", "lost"].includes(body.status)) {
        return NextResponse.json(
          { ok: false, error: "Invalid status" },
          { status: 400 }
        )
      }
      updates.status = body.status as LeadStatus
    }
    if (body.notes !== undefined) {
      updates.notes = body.notes || null
    }
    if (body.phoneNumber !== undefined) {
      updates.phoneNumber = body.phoneNumber
    }
    if (body.travelPreferences !== undefined) {
      updates.travelPreferences = body.travelPreferences
    }

    await db.collection("leads").doc(params.id).update(updates)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = getFirebaseAdmin()
    await db.collection("leads").doc(params.id).delete()

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

