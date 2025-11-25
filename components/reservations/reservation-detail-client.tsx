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
import { ArrowLeft, User, Calendar, Building2 } from "lucide-react"

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

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: Date
  updatedAt: Date
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
              <Badge>{reservation.paymentStatus}</Badge>
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
                      <div className="font-medium">{lead.phoneNumber}</div>
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
                      {format(reservation.travelDetails.departureDate, "EEEE, MMMM d, yyyy")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Return</div>
                    <div className="font-medium">
                      {format(reservation.travelDetails.returnDate, "EEEE, MMMM d, yyyy")}
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Booking Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Platform</div>
                  <div className="font-medium capitalize">{reservation.bookingPlatform}</div>
                </div>
                {reservation.platformConfirmationNumber && (
                  <div>
                    <div className="text-sm text-muted-foreground">Confirmation Number</div>
                    <div className="font-mono font-medium">{reservation.platformConfirmationNumber}</div>
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

