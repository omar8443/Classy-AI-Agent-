import { getReservations } from "@/lib/firestore/reservations"
import { ReservationsPageClient } from "@/components/reservations/reservations-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReservationsPage() {
  const reservations = await getReservations()

  // Serialize dates for client components
  const serializedReservations = reservations.map((res) => ({
    ...res,
    createdAt: res.createdAt instanceof Date ? res.createdAt : res.createdAt?.toDate?.() || new Date(),
    updatedAt: res.updatedAt instanceof Date ? res.updatedAt : res.updatedAt?.toDate?.() || new Date(),
    travelDetails: {
      ...res.travelDetails,
      departureDate: res.travelDetails.departureDate instanceof Date 
        ? res.travelDetails.departureDate 
        : res.travelDetails.departureDate?.toDate?.() || new Date(),
      returnDate: res.travelDetails.returnDate instanceof Date 
        ? res.travelDetails.returnDate 
        : res.travelDetails.returnDate?.toDate?.() || new Date(),
    },
    documents: res.documents.map((doc) => ({
      ...doc,
      uploadedAt: doc.uploadedAt instanceof Date ? doc.uploadedAt : doc.uploadedAt?.toDate?.() || new Date(),
    })),
    history: res.history.map((entry) => ({
      ...entry,
      timestamp: entry.timestamp instanceof Date ? entry.timestamp : entry.timestamp?.toDate?.() || new Date(),
    })),
  }))

  const pendingCount = serializedReservations.filter((r) => r.status === "pending").length
  const confirmedCount = serializedReservations.filter((r) => r.status === "confirmed").length
  const totalRevenue = serializedReservations
    .filter((r) => r.paymentStatus === "paid")
    .reduce((sum, r) => sum + r.pricing.total, 0)

  return (
    <ReservationsPageClient
      reservations={serializedReservations}
      pendingCount={pendingCount}
      confirmedCount={confirmedCount}
      totalRevenue={totalRevenue}
    />
  )
}

