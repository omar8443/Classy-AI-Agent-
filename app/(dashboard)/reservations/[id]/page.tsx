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

  // Serialize dates
  const serializedReservation = {
    ...reservation,
    createdAt: reservation.createdAt instanceof Date ? reservation.createdAt : reservation.createdAt?.toDate?.() || new Date(),
    updatedAt: reservation.updatedAt instanceof Date ? reservation.updatedAt : reservation.updatedAt?.toDate?.() || new Date(),
    travelDetails: {
      ...reservation.travelDetails,
      departureDate: reservation.travelDetails.departureDate instanceof Date 
        ? reservation.travelDetails.departureDate 
        : reservation.travelDetails.departureDate?.toDate?.() || new Date(),
      returnDate: reservation.travelDetails.returnDate instanceof Date 
        ? reservation.travelDetails.returnDate 
        : reservation.travelDetails.returnDate?.toDate?.() || new Date(),
    },
    documents: reservation.documents.map((doc) => ({
      ...doc,
      uploadedAt: doc.uploadedAt instanceof Date ? doc.uploadedAt : doc.uploadedAt?.toDate?.() || new Date(),
    })),
    history: reservation.history.map((entry) => ({
      ...entry,
      timestamp: entry.timestamp instanceof Date ? entry.timestamp : entry.timestamp?.toDate?.() || new Date(),
    })),
  }

  const serializedLead = lead ? {
    ...lead,
    createdAt: lead.createdAt instanceof Date ? lead.createdAt : lead.createdAt?.toDate?.() || new Date(),
    updatedAt: lead.updatedAt instanceof Date ? lead.updatedAt : lead.updatedAt?.toDate?.() || new Date(),
  } : null

  return <ReservationDetailClient reservation={serializedReservation} lead={serializedLead} />
}

