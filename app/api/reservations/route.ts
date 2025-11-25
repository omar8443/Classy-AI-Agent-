import { NextRequest, NextResponse } from "next/server"
import { createReservation } from "@/lib/firestore/reservations"
import { generateReservationId } from "@/types/reservation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const reservationId = await createReservation(body)

    return NextResponse.json({
      ok: true,
      id: reservationId,
      reservationId: body.reservationId || generateReservationId(),
    })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

