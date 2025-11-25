import { z } from "zod"

export const LeadStatusSchema = z.enum([
  "new",
  "in_progress",
  "booked",
  "closed",
  "lost",
])

export type LeadStatus = z.infer<typeof LeadStatusSchema>

export interface Lead {
  id: string
  createdAt: Date | FirebaseFirestore.Timestamp
  updatedAt: Date | FirebaseFirestore.Timestamp
  phoneNumber: string
  name: string | null
  email: string | null
  quotedPrice?: string | null
  source: string
  status: LeadStatus
  tags: string[]
  notes: string | null
  lastCallId: string | null
  totalCalls: number
}

export const LeadSchema = z.object({
  phoneNumber: z.string().min(1),
  name: z.string().nullable(),
  email: z.string().email().nullable().or(z.literal("")),
  quotedPrice: z.string().nullable().optional(),
  source: z.string().default("elevenlabs_voice_agent"),
  status: LeadStatusSchema.default("new"),
  tags: z.array(z.string()).default([]),
  notes: z.string().nullable(),
  lastCallId: z.string().nullable(),
  totalCalls: z.number().int().min(0).default(0),
})

