import { z } from "zod"

export const UserRoleSchema = z.enum(["admin", "manager", "agent", "viewer"])

export type UserRole = z.infer<typeof UserRoleSchema>

export interface UserPermissions {
  canViewDashboard: boolean
  canManageLeads: boolean
  canManageCalls: boolean
  canCreateReservations: boolean
  canManageReservations: boolean
  canManageUsers: boolean
  canAccessSettings: boolean
  canViewAnalytics: boolean
}

export interface UserStats {
  totalCalls: number
  totalReservations: number
  totalRevenue: number
  avgCallDuration: number
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: "fr" | "en"
  notifications: {
    email: boolean
    push: boolean
    newLead: boolean
    newReservation: boolean
  }
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  permissions: UserPermissions
  avatar?: string | null
  phone?: string | null
  stats: UserStats
  preferences: UserPreferences
  createdAt: Date | FirebaseFirestore.Timestamp
  updatedAt: Date | FirebaseFirestore.Timestamp
}

export const UserPermissionsSchema = z.object({
  canViewDashboard: z.boolean().default(true),
  canManageLeads: z.boolean().default(false),
  canManageCalls: z.boolean().default(false),
  canCreateReservations: z.boolean().default(false),
  canManageReservations: z.boolean().default(false),
  canManageUsers: z.boolean().default(false),
  canAccessSettings: z.boolean().default(false),
  canViewAnalytics: z.boolean().default(false),
})

export const UserStatsSchema = z.object({
  totalCalls: z.number().default(0),
  totalReservations: z.number().default(0),
  totalRevenue: z.number().default(0),
  avgCallDuration: z.number().default(0),
})

export const UserPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["fr", "en"]).default("fr"),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    newLead: z.boolean().default(true),
    newReservation: z.boolean().default(true),
  }).default({
    email: true,
    push: false,
    newLead: true,
    newReservation: true,
  }),
})

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema.default("agent"),
  permissions: UserPermissionsSchema,
  avatar: z.string().url().nullable().optional(),
  phone: z.string().nullable().optional(),
  stats: UserStatsSchema.default({
    totalCalls: 0,
    totalReservations: 0,
    totalRevenue: 0,
    avgCallDuration: 0,
  }),
  preferences: UserPreferencesSchema.default({
    theme: "system",
    language: "fr",
    notifications: {
      email: true,
      push: false,
      newLead: true,
      newReservation: true,
    },
  }),
})

// Default permissions by role
export const defaultPermissions: Record<UserRole, UserPermissions> = {
  admin: {
    canViewDashboard: true,
    canManageLeads: true,
    canManageCalls: true,
    canCreateReservations: true,
    canManageReservations: true,
    canManageUsers: true,
    canAccessSettings: true,
    canViewAnalytics: true,
  },
  manager: {
    canViewDashboard: true,
    canManageLeads: true,
    canManageCalls: true,
    canCreateReservations: true,
    canManageReservations: true,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAnalytics: true,
  },
  agent: {
    canViewDashboard: true,
    canManageLeads: true,
    canManageCalls: true,
    canCreateReservations: true,
    canManageReservations: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAnalytics: false,
  },
  viewer: {
    canViewDashboard: true,
    canManageLeads: false,
    canManageCalls: false,
    canCreateReservations: false,
    canManageReservations: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAnalytics: false,
  },
}
