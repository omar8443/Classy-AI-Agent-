import { z } from "zod"

export interface ElevenLabsPostCallPayload {
  call_id?: string
  callId?: string
  id?: string
  timestamp?: string | number
  created_at?: string | number
  createdAt?: string | number
  caller_phone_number?: string
  callerPhoneNumber?: string
  phone_number?: string
  phoneNumber?: string
  from?: string
  caller_name?: string | null
  callerName?: string | null
  name?: string | null
  transcript?: string | string[] | Array<{ speaker: string; text: string }>
  audio_url?: string | null
  audioUrl?: string | null
  recording_url?: string | null
  recordingUrl?: string | null
  duration?: number
  durationSeconds?: number
  agent_id?: string
  agentId?: string
  metadata?: Record<string, unknown>
}

// Flexible schema that accepts various field name formats from ElevenLabs
export const ElevenLabsPostCallPayloadSchema = z.object({
  // Call ID - accept multiple possible field names
  call_id: z.string().min(1).optional(),
  callId: z.string().min(1).optional(),
  id: z.string().min(1).optional(),
  
  // Timestamp - accept multiple formats and field names
  timestamp: z.union([z.string(), z.number()]).optional(),
  created_at: z.union([z.string(), z.number()]).optional(),
  createdAt: z.union([z.string(), z.number()]).optional(),
  
  // Caller phone number - accept multiple field names
  caller_phone_number: z.string().min(1).optional(),
  callerPhoneNumber: z.string().min(1).optional(),
  phone_number: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  from: z.string().min(1).optional(),
  
  // Caller name - accept multiple field names
  caller_name: z.string().nullable().optional(),
  callerName: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  
  // Transcript - flexible format
  transcript: z.union([
    z.string(),
    z.array(z.string()),
    z.array(z.object({ speaker: z.string(), text: z.string() })),
  ]).optional(),
  
  // Audio URL - accept multiple field names
  audio_url: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  recording_url: z.string().nullable().optional(),
  recordingUrl: z.string().nullable().optional(),
  
  // Duration - accept multiple field names
  duration: z.number().optional(),
  durationSeconds: z.number().optional(),
  
  // Agent ID
  agent_id: z.string().optional(),
  agentId: z.string().optional(),
  
  // Metadata
  metadata: z.record(z.unknown()).optional(),
}).passthrough() // Allow additional fields we don't know about

