import { z } from "zod"

export type ReservationStatus = "pending" | "confirmed" | "modified" | "cancelled" | "completed"
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded"
export type BookingPlatform = "booking.com" | "expedia" | "amadeus" | "sabre" | "direct" | "other"
export type Currency = "CAD" | "USD" | "EUR"

export interface Pricing {
  subtotal: number
  taxes: number
  fees: number
  total: number
  currency: Currency
}

export interface Travelers {
  adults: number
  children: number
  infants: number
}

export interface TravelDetails {
  destination: string
  departureDate: Date | FirebaseFirestore.Timestamp
  returnDate: Date | FirebaseFirestore.Timestamp
  travelers: Travelers
  flightDetails?: string | null
  hotelDetails?: string | null
  additionalServices?: string[]
}

export interface ReservationDocument {
  id: string
  name: string
  url: string
  type: "confirmation" | "invoice" | "e-ticket" | "other"
  uploadedAt: Date | FirebaseFirestore.Timestamp
}

export interface ReservationHistoryEntry {
  action: string
  performedBy: string
  timestamp: Date | FirebaseFirestore.Timestamp
  details?: string | null
}

export interface Reservation {
  id: string
  reservationId: string // Format: VCT-YYYY-XXXXX
  leadId: string
  callId?: string | null
  
  // Agent info
  agentId: string
  agentName: string
  agentEmail: string
  
  // Pricing (no commission field as per user request)
  pricing: Pricing
  
  // Booking platform
  bookingPlatform: BookingPlatform
  platformConfirmationNumber?: string | null
  
  // Travel details
  travelDetails: TravelDetails
  
  // Status
  status: ReservationStatus
  paymentStatus: PaymentStatus
  
  // Documents
  documents: ReservationDocument[]
  
  // Notes & History
  notes: string | null
  history: ReservationHistoryEntry[]
  
  // Timestamps
  createdAt: Date | FirebaseFirestore.Timestamp
  updatedAt: Date | FirebaseFirestore.Timestamp
}

export const PricingSchema = z.object({
  subtotal: z.number().min(0),
  taxes: z.number().min(0),
  fees: z.number().min(0),
  total: z.number().min(0),
  currency: z.enum(["CAD", "USD", "EUR"]),
})

export const TravelersSchema = z.object({
  adults: z.number().int().min(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
})

export const TravelDetailsSchema = z.object({
  destination: z.string().min(1),
  departureDate: z.date(),
  returnDate: z.date(),
  travelers: TravelersSchema,
  flightDetails: z.string().nullable().optional(),
  hotelDetails: z.string().nullable().optional(),
  additionalServices: z.array(z.string()).default([]),
})

export const ReservationDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.enum(["confirmation", "invoice", "e-ticket", "other"]),
  uploadedAt: z.date(),
})

export const ReservationHistoryEntrySchema = z.object({
  action: z.string(),
  performedBy: z.string(),
  timestamp: z.date(),
  details: z.string().nullable().optional(),
})

export const ReservationSchema = z.object({
  reservationId: z.string(),
  leadId: z.string(),
  callId: z.string().nullable().optional(),
  agentId: z.string(),
  agentName: z.string(),
  agentEmail: z.string(),
  pricing: PricingSchema,
  bookingPlatform: z.enum(["booking.com", "expedia", "amadeus", "sabre", "direct", "other"]),
  platformConfirmationNumber: z.string().nullable().optional(),
  travelDetails: TravelDetailsSchema,
  status: z.enum(["pending", "confirmed", "modified", "cancelled", "completed"]).default("pending"),
  paymentStatus: z.enum(["pending", "partial", "paid", "refunded"]).default("pending"),
  documents: z.array(ReservationDocumentSchema).default([]),
  notes: z.string().nullable().optional(),
  history: z.array(ReservationHistoryEntrySchema).default([]),
})

// Helper function to generate reservation ID
export function generateReservationId(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `VCT-${year}-${random}`
}

