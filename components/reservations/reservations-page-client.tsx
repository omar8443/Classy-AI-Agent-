"use client"

import { Reservation } from "@/types/reservation"
import { ReservationsTable } from "@/components/reservations/reservations-table"
import { PageWrapper } from "@/components/motion/page-wrapper"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, CheckCircle } from "lucide-react"

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

interface ReservationsPageClientProps {
  reservations: SerializedReservation[]
  pendingCount: number
  confirmedCount: number
}

export function ReservationsPageClient({
  reservations,
  pendingCount,
  confirmedCount,
}: ReservationsPageClientProps) {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Reservations</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Manage travel bookings and reservations
            </p>
          </div>
          <Link href="/reservations/new">
            <Button className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-4 py-2 h-11">
              <Plus className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Total</p>
                <p className="text-2xl font-semibold text-neutral-900">{reservations.length}</p>
                <p className="text-xs text-neutral-400 mt-1">All reservations</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-neutral-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Pending</p>
                <p className="text-2xl font-semibold text-neutral-900">{pendingCount}</p>
                <p className="text-xs text-neutral-400 mt-1">Awaiting confirmation</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Confirmed</p>
                <p className="text-2xl font-semibold text-neutral-900">{confirmedCount}</p>
                <p className="text-xs text-neutral-400 mt-1">Active bookings</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">All Reservations</h2>
          <ReservationsTable reservations={reservations} />
        </div>
      </div>
    </PageWrapper>
  )
}

