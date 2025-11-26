"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Reservation, ReservationStatus } from "@/types/reservation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type SerializedReservation = Omit<Reservation, "createdAt" | "updatedAt" | "travelDetails" | "documents" | "history"> & {
  createdAt: string
  updatedAt: string
  travelDetails: Omit<Reservation["travelDetails"], "departureDate" | "returnDate"> & {
    departureDate: string
    returnDate: string
  }
  documents: Array<Omit<Reservation["documents"][0], "uploadedAt"> & { uploadedAt: string }>
  history: Array<Omit<Reservation["history"][0], "timestamp"> & { timestamp: string }>
}

interface ReservationsTableProps {
  reservations: SerializedReservation[]
}

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  modified: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-neutral-100 text-neutral-700",
}

export function ReservationsTable({ reservations }: ReservationsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      searchQuery === "" ||
      res.reservationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.travelDetails.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.agentName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || res.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by ID, destination, or agent..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm bg-white rounded-xl border-neutral-100 text-neutral-900 placeholder:text-neutral-300 h-11"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white rounded-xl border-neutral-100 h-11">
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
      </div>

      {filteredReservations.length === 0 ? (
        <div className="py-12 text-center text-neutral-400 bg-white rounded-2xl">
          {reservations.length === 0 ? "No reservations yet." : "No reservations match your filters."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-xs uppercase tracking-wide text-neutral-400">
                <th className="h-12 px-5 text-left align-middle font-medium">ID</th>
                <th className="h-12 px-5 text-left align-middle font-medium">Destination</th>
                <th className="h-12 px-5 text-left align-middle font-medium">Dates</th>
                <th className="h-12 px-5 text-left align-middle font-medium">Price</th>
                <th className="h-12 px-5 text-left align-middle font-medium">Agent</th>
                <th className="h-12 px-5 text-left align-middle font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation, i) => (
                <tr
                  key={reservation.id}
                  onClick={() => router.push(`/reservations/${reservation.id}`)}
                  className={`cursor-pointer transition-colors hover:bg-neutral-50 select-none ${
                    i !== filteredReservations.length - 1 ? "border-b border-neutral-100" : ""
                  }`}
                >
                  <td className="px-5 py-4 font-medium text-neutral-900">{reservation.reservationId}</td>
                  <td className="px-5 py-4 text-neutral-900">{reservation.travelDetails.destination}</td>
                  <td className="px-5 py-4 text-neutral-400">
                    {format(new Date(reservation.travelDetails.departureDate), "MMM d")} -{" "}
                    {format(new Date(reservation.travelDetails.returnDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-4 font-medium text-neutral-900">
                    {reservation.pricing.currency} ${reservation.pricing.total.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-neutral-400">{reservation.agentName}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[reservation.status]}`}>
                      {reservation.status}
                    </span>
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

