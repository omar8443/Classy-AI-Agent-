import { z } from "zod"

export interface BannedNumber {
  id: string
  phoneNumber: string
  reason: string
  bannedBy: string
  bannedByName: string
  createdAt: Date | FirebaseFirestore.Timestamp
}

export const BannedNumberSchema = z.object({
  phoneNumber: z.string().min(1),
  reason: z.string().min(1),
  bannedBy: z.string(),
  bannedByName: z.string(),
})

