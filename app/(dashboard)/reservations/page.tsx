import { getReservations } from "@/lib/firestore/reservations"
import { ReservationsPageClient } from "@/components/reservations/reservations-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReservationsPage() {
  const reservations = await getReservations()

  // Deep serialize to plain JSON objects
  const serializedReservations = JSON.parse(JSON.stringify(reservations))

  const pendingCount = serializedReservations.filter((r: any) => r.status === "pending").length
  const confirmedCount = serializedReservations.filter((r: any) => r.status === "confirmed").length

  return (
    <ReservationsPageClient
      reservations={serializedReservations}
      pendingCount={pendingCount}
      confirmedCount={confirmedCount}
    />
  )
}

