import { z } from "zod"

export const UserRoleSchema = z.enum(["admin", "agent", "viewer"])

export type UserRole = z.infer<typeof UserRoleSchema>

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date | FirebaseFirestore.Timestamp
  updatedAt: Date | FirebaseFirestore.Timestamp
  photoUrl?: string | null
  phoneNumber?: string | null
  isActive: boolean
}

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema.default("agent"),
  photoUrl: z.string().url().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
})
