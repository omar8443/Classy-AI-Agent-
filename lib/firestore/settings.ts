import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { AppSettings, AppSettingsSchema } from "@/types/settings"

const SETTINGS_DOC_ID = "config"

/**
 * Get application settings
 */
export async function getSettings(): Promise<AppSettings | null> {
  const { db } = getFirebaseAdmin()
  const doc = await db.collection("settings").doc(SETTINGS_DOC_ID).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data()
  if (!data) {
    return null
  }

  return {
    ...data,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as AppSettings
}

/**
 * Update application settings
 */
export async function updateSettings(
  settings: Partial<Omit<AppSettings, "updatedAt">>,
  userId: string
): Promise<void> {
  const { db } = getFirebaseAdmin()

  await db
    .collection("settings")
    .doc(SETTINGS_DOC_ID)
    .set(
      {
        ...settings,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      { merge: true }
    )
}

/**
 * Initialize default settings if not exist
 */
export async function initializeSettings(userId: string): Promise<void> {
  const { db } = getFirebaseAdmin()
  const doc = await db.collection("settings").doc(SETTINGS_DOC_ID).get()

  if (doc.exists) {
    return
  }

  const defaultSettings = AppSettingsSchema.parse({
    company: {
      name: "Voyage Classy Travel",
      logo: null,
      primaryColor: "#0EA5E9",
      contactEmail: "contact@voyageclassy.com",
      contactPhone: "+1 514-555-0100",
      address: null,
    },
    integrations: {
      elevenlabs: {
        enabled: true,
        webhookSecret: process.env.ELEVENLABS_WEBHOOK_SECRET || "",
        lastSync: null,
      },
      openai: {
        enabled: true,
        model: "gpt-4",
      },
      slack: {
        enabled: false,
        webhookUrl: "",
      },
    },
    defaults: {
      timezone: "America/Toronto",
      dateFormat: "MMM d, yyyy",
      currency: "CAD",
      language: "fr",
    },
    updatedBy: userId,
  })

  await db.collection("settings").doc(SETTINGS_DOC_ID).set({
    ...defaultSettings,
    updatedAt: new Date(),
  })
}

