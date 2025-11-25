"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Reservation, ReservationStatus, PaymentStatus } from "@/types/reservation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type SerializedReservation = Omit<Reservation, "createdAt" | "updatedAt" | "travelDetails" | "documents" | "history"> & {
  createdAt: Date
  updatedAt: Date
  travelDetails: Omit<Reservation["travelDetails"], "departureDate" | "returnDate"> & {
    departureDate: Date
    returnDate: Date
  }
  documents: Array<Omit<Reservation["documents"][0], "uploadedAt"> & { uploadedAt: Date }>
  history: Array<Omit<Reservation["history"][0], "timestamp"> & { timestamp: Date }>
}

interface ReservationsTableProps {
  reservations: SerializedReservation[]
}

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  modified: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
}

const paymentColors: Record<PaymentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  partial: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  refunded: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

export function ReservationsTable({ reservations }: ReservationsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      searchQuery === "" ||
      res.reservationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.travelDetails.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.agentName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || res.status === statusFilter
    const matchesPlatform = platformFilter === "all" || res.bookingPlatform === platformFilter

    return matchesSearch && matchesStatus && matchesPlatform
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by ID, destination, or agent..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="modified">Modified</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="booking.com">Booking.com</SelectItem>
            <SelectItem value="expedia">Expedia</SelectItem>
            <SelectItem value="amadeus">Amadeus</SelectItem>
            <SelectItem value="sabre">Sabre</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {reservations.length === 0 ? "No reservations yet." : "No reservations match your filters."}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="h-12 px-4 text-left align-middle font-medium">ID</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Destination</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Dates</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Price</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Platform</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Agent</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  onClick={() => router.push(`/reservations/${reservation.id}`)}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 font-medium">{reservation.reservationId}</td>
                  <td className="p-4">{reservation.travelDetails.destination}</td>
                  <td className="p-4 text-muted-foreground">
                    {format(reservation.travelDetails.departureDate, "MMM d")} -{" "}
                    {format(reservation.travelDetails.returnDate, "MMM d, yyyy")}
                  </td>
                  <td className="p-4 font-medium">
                    {reservation.pricing.currency} ${reservation.pricing.total.toLocaleString()}
                  </td>
                  <td className="p-4 text-muted-foreground">{reservation.bookingPlatform}</td>
                  <td className="p-4 text-muted-foreground">{reservation.agentName}</td>
                  <td className="p-4">
                    <Badge className={statusColors[reservation.status]}>{reservation.status}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={paymentColors[reservation.paymentStatus]}>
                      {reservation.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

