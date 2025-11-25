"use client"

import { Reservation } from "@/types/reservation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReservationsTable } from "@/components/reservations/reservations-table"
import { PageWrapper } from "@/components/motion/page-wrapper"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, CheckCircle, DollarSign } from "lucide-react"

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
  totalRevenue: number
}

export function ReservationsPageClient({
  reservations,
  pendingCount,
  confirmedCount,
  totalRevenue,
}: ReservationsPageClientProps) {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reservations</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage travel bookings and reservations
            </p>
          </div>
          <Link href="/reservations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservations.length}</div>
              <p className="text-xs text-muted-foreground">All reservations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedCount}</div>
              <p className="text-xs text-muted-foreground">Active bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total paid</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationsTable reservations={reservations} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

