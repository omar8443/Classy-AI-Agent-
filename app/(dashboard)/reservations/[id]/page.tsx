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

  // Serialize dates to ISO strings for client components
  const serializedReservation = {
    ...reservation,
    createdAt: (reservation.createdAt instanceof Date ? reservation.createdAt : new Date()).toISOString(),
    updatedAt: (reservation.updatedAt instanceof Date ? reservation.updatedAt : new Date()).toISOString(),
    travelDetails: {
      ...reservation.travelDetails,
      departureDate: (reservation.travelDetails.departureDate instanceof Date 
        ? reservation.travelDetails.departureDate 
        : new Date()).toISOString(),
      returnDate: (reservation.travelDetails.returnDate instanceof Date 
        ? reservation.travelDetails.returnDate 
        : new Date()).toISOString(),
    },
    documents: reservation.documents.map((doc) => ({
      ...doc,
      uploadedAt: (doc.uploadedAt instanceof Date ? doc.uploadedAt : new Date()).toISOString(),
    })),
    history: reservation.history.map((entry) => ({
      ...entry,
      timestamp: (entry.timestamp instanceof Date ? entry.timestamp : new Date()).toISOString(),
    })),
  }

  const serializedLead = lead ? {
    ...lead,
    createdAt: (lead.createdAt instanceof Date ? lead.createdAt : new Date()).toISOString(),
    updatedAt: (lead.updatedAt instanceof Date ? lead.updatedAt : new Date()).toISOString(),
  } : null

  return <ReservationDetailClient reservation={serializedReservation} lead={serializedLead} />
}

