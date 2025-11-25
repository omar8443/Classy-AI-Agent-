import { z } from "zod"

export const CallDirectionSchema = z.enum(["inbound", "outbound"]).nullable()
export const CallSentimentSchema = z.enum(["positive", "neutral", "negative"]).nullable()

export type CallDirection = z.infer<typeof CallDirectionSchema>
export type CallSentiment = z.infer<typeof CallSentimentSchema>

export interface Call {
  id: string
  leadId: string | null
  createdAt: Date | FirebaseFirestore.Timestamp
  endedAt: Date | FirebaseFirestore.Timestamp | null
  direction: CallDirection
  callerPhoneNumber: string
  callerName: string | null
  provider: string
  rawPayload: Record<string, unknown>
  transcript: string
  summary: string
  sentiment: CallSentiment
  durationSeconds: number | null
  audioUrl: string | null
  labels: string[]
}

export const CallSchema = z.object({
  leadId: z.string().nullable(),
  direction: CallDirectionSchema,
  callerPhoneNumber: z.string().min(1),
  callerName: z.string().nullable(),
  provider: z.string().default("elevenlabs"),
  rawPayload: z.record(z.unknown()),
  transcript: z.string().default(""),
  summary: z.string().default(""),
  sentiment: CallSentimentSchema,
  durationSeconds: z.number().int().positive().nullable(),
  audioUrl: z.string().url().nullable().or(z.literal("")),
  labels: z.array(z.string()).default([]),
})

