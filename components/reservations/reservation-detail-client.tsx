"use client"

import { Reservation } from "@/types/reservation"
import { Lead } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { ReservationTimeline } from "@/components/reservations/reservation-timeline"
import { PricingBreakdown } from "@/components/reservations/pricing-breakdown"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft, User, Calendar } from "lucide-react"

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length >= 10) {
    const last10 = digits.slice(-10)
    return `+1 ${last10.slice(0, 3)}-${last10.slice(3, 6)}-${last10.slice(6)}`
  }
  return phone
}

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

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
} | null

interface ReservationDetailClientProps {
  reservation: SerializedReservation
  lead: SerializedLead
}

export function ReservationDetailClient({ reservation, lead }: ReservationDetailClientProps) {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/reservations"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{reservation.reservationId}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{reservation.status}</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead ? (
                  <>
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <Link href={`/leads/${lead.id}`} className="font-medium text-primary hover:underline">
                        {lead.name || "Unknown"}
                      </Link>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{formatPhoneNumber(lead.phoneNumber)}</div>
                    </div>
                    {lead.email && (
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <a href={`mailto:${lead.email}`} className="font-medium text-primary hover:underline">
                          {lead.email}
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Lead information not available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Travel Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Destination</div>
                  <div className="text-xl font-semibold">{reservation.travelDetails.destination}</div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Departure</div>
                    <div className="font-medium">
                      {format(new Date(reservation.travelDetails.departureDate), "EEEE, MMMM d, yyyy")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Return</div>
                    <div className="font-medium">
                      {format(new Date(reservation.travelDetails.returnDate), "EEEE, MMMM d, yyyy")}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Travelers</div>
                  <div className="font-medium">
                    {reservation.travelDetails.travelers.adults} Adult(s)
                    {reservation.travelDetails.travelers.children > 0 && `, ${reservation.travelDetails.travelers.children} Child(ren)`}
                    {reservation.travelDetails.travelers.infants > 0 && `, ${reservation.travelDetails.travelers.infants} Infant(s)`}
                  </div>
                </div>
                {reservation.travelDetails.flightDetails && (
                  <div>
                    <div className="text-sm text-muted-foreground">Flight Details</div>
                    <div className="text-sm whitespace-pre-wrap">{reservation.travelDetails.flightDetails}</div>
                  </div>
                )}
                {reservation.travelDetails.hotelDetails && (
                  <div>
                    <div className="text-sm text-muted-foreground">Hotel Details</div>
                    <div className="text-sm whitespace-pre-wrap">{reservation.travelDetails.hotelDetails}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {reservation.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{reservation.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <PricingBreakdown pricing={reservation.pricing} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-medium">{reservation.agentName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <a href={`mailto:${reservation.agentEmail}`} className="text-sm text-primary hover:underline">
                    {reservation.agentEmail}
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent>
                <ReservationTimeline history={reservation.history} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

