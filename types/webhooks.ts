import { z } from "zod"

export interface ElevenLabsPostCallPayload {
  call_id: string
  timestamp: string | number
  caller_phone_number: string
  caller_name?: string | null
  transcript?: string | string[] | Array<{ speaker: string; text: string }>
  audio_url?: string | null
  duration?: number
  agent_id?: string
  metadata?: Record<string, unknown>
}

export const ElevenLabsPostCallPayloadSchema = z.object({
  call_id: z.string().min(1),
  timestamp: z.union([z.string(), z.number()]),
  caller_phone_number: z.string().min(1),
  caller_name: z.string().nullable().optional(),
  transcript: z.union([
    z.string(),
    z.array(z.string()),
    z.array(z.object({ speaker: z.string(), text: z.string() })),
  ]).optional(),
  audio_url: z.string().url().nullable().optional(),
  duration: z.number().positive().optional(),
  agent_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

