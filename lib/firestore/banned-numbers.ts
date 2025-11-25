import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { BannedNumber, BannedNumberSchema } from "@/types/banned-numbers"

/**
 * Normalize phone number (remove non-digits)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

/**
 * Ban a phone number
 */
export async function banNumber(
  phoneNumber: string,
  reason: string,
  userId: string,
  userName: string
): Promise<void> {
  const { db } = getFirebaseAdmin()

  const normalizedPhone = normalizePhone(phoneNumber)

  const bannedData = BannedNumberSchema.parse({
    phoneNumber: normalizedPhone,
    reason,
    bannedBy: userId,
    bannedByName: userName,
  })

  await db.collection("bannedNumbers").add({
    ...bannedData,
    createdAt: new Date(),
  })
}

/**
 * Check if a phone number is banned
 */
export async function isNumberBanned(phoneNumber: string): Promise<boolean> {
  const { db } = getFirebaseAdmin()
  const normalizedPhone = normalizePhone(phoneNumber)

  const snapshot = await db
    .collection("bannedNumbers")
    .where("phoneNumber", "==", normalizedPhone)
    .limit(1)
    .get()

  return !snapshot.empty
}

/**
 * Get all banned numbers
 */
export async function getBannedNumbers(): Promise<BannedNumber[]> {
  const { db } = getFirebaseAdmin()
  const snapshot = await db.collection("bannedNumbers").orderBy("createdAt", "desc").get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as BannedNumber[]
}

/**
 * Unban a phone number
 */
export async function unbanNumber(bannedNumberId: string): Promise<void> {
  const { db } = getFirebaseAdmin()
  await db.collection("bannedNumbers").doc(bannedNumberId).delete()
}

