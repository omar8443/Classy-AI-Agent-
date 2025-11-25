import { notFound } from "next/navigation"
import { getReservationById } from "@/lib/firestore/reservations"
import { getLeadById } from "@/lib/firestore/leads"
import { ReservationDetailClient } from "@/components/reservations/reservation-detail-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReservationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const reservation = await getReservationById(params.id)

  if (!reservation) {
    notFound()
  }

  const lead = reservation.leadId ? await getLeadById(reservation.leadId) : null

  // Deep serialize to plain JSON objects
  const serializedReservation = JSON.parse(JSON.stringify(reservation))
  const serializedLead = lead ? JSON.parse(JSON.stringify(lead)) : null

  return <ReservationDetailClient reservation={serializedReservation} lead={serializedLead} />
}

