import { z } from "zod"

export interface CompanySettings {
  name: string
  logo?: string | null
  primaryColor: string
  contactEmail: string
  contactPhone: string
  address?: string | null
}

export interface IntegrationSettings {
  elevenlabs: {
    enabled: boolean
    webhookSecret: string
    lastSync?: Date | null
  }
  openai: {
    enabled: boolean
    model: string
  }
  slack?: {
    enabled: boolean
    webhookUrl: string
  }
}

export interface DefaultSettings {
  timezone: string
  dateFormat: string
  currency: string
  language: string
}

export interface AppSettings {
  company: CompanySettings
  integrations: IntegrationSettings
  defaults: DefaultSettings
  updatedAt: Date | FirebaseFirestore.Timestamp
  updatedBy: string
}

export const CompanySettingsSchema = z.object({
  name: z.string().min(1),
  logo: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  address: z.string().nullable().optional(),
})

export const IntegrationSettingsSchema = z.object({
  elevenlabs: z.object({
    enabled: z.boolean(),
    webhookSecret: z.string(),
    lastSync: z.date().nullable().optional(),
  }),
  openai: z.object({
    enabled: z.boolean(),
    model: z.string(),
  }),
  slack: z
    .object({
      enabled: z.boolean(),
      webhookUrl: z.string().url(),
    })
    .optional(),
})

export const DefaultSettingsSchema = z.object({
  timezone: z.string(),
  dateFormat: z.string(),
  currency: z.string(),
  language: z.string(),
})

export const AppSettingsSchema = z.object({
  company: CompanySettingsSchema,
  integrations: IntegrationSettingsSchema,
  defaults: DefaultSettingsSchema,
  updatedBy: z.string(),
})

