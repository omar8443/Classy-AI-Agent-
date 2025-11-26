import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { Reservation, ReservationSchema, generateReservationId } from "@/types/reservation"
import type { QueryDocumentSnapshot } from "firebase-admin/firestore"

// Helper function to safely convert Firestore Timestamp or Date to Date
function toDate(value: any): Date {
  if (!value) return new Date()
  if (value instanceof Date) return value
  if (typeof value.toDate === 'function') return value.toDate()
  if (typeof value === 'string') return new Date(value)
  return new Date()
}

export async function getReservations(limit?: number): Promise<Reservation[]> {
  const { db } = getFirebaseAdmin()
  let query = db.collection("reservations").orderBy("createdAt", "desc")
  
  if (limit) {
    query = query.limit(limit) as any
  }
  
  const snapshot = await query.get()
  
  return snapshot.docs.map((doc: QueryDocumentSnapshot) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      travelDetails: {
        ...data.travelDetails,
        departureDate: toDate(data.travelDetails?.departureDate),
        returnDate: toDate(data.travelDetails?.returnDate),
      },
      documents: data.documents?.map((doc: any) => ({
        ...doc,
        uploadedAt: toDate(doc.uploadedAt),
      })) || [],
      history: data.history?.map((entry: any) => ({
        ...entry,
        timestamp: toDate(entry.timestamp),
      })) || [],
    }
  }) as Reservation[]
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  const { db } = getFirebaseAdmin()
  const doc = await db.collection("reservations").doc(id).get()
  
  if (!doc.exists) {
    return null
  }

  const data = doc.data()
  if (!data) {
    return null
  }

  return {
    id: doc.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    travelDetails: {
      ...data.travelDetails,
      departureDate: toDate(data.travelDetails?.departureDate),
      returnDate: toDate(data.travelDetails?.returnDate),
    },
    documents: data.documents?.map((doc: any) => ({
      ...doc,
      uploadedAt: toDate(doc.uploadedAt),
    })) || [],
    history: data.history?.map((entry: any) => ({
      ...entry,
      timestamp: toDate(entry.timestamp),
    })) || [],
  } as Reservation
}

export async function getReservationsByLeadId(leadId: string): Promise<Reservation[]> {
  const { db } = getFirebaseAdmin()
  const snapshot = await db
    .collection("reservations")
    .where("leadId", "==", leadId)
    .orderBy("createdAt", "desc")
    .get()
  
  return snapshot.docs.map((doc: QueryDocumentSnapshot) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      travelDetails: {
        ...data.travelDetails,
        departureDate: toDate(data.travelDetails?.departureDate),
        returnDate: toDate(data.travelDetails?.returnDate),
      },
      documents: data.documents?.map((doc: any) => ({
        ...doc,
        uploadedAt: toDate(doc.uploadedAt),
      })) || [],
      history: data.history?.map((entry: any) => ({
        ...entry,
        timestamp: toDate(entry.timestamp),
      })) || [],
    }
  }) as Reservation[]
}

export async function createReservation(
  data: Omit<Reservation, "id" | "reservationId" | "createdAt" | "updatedAt" | "history">
): Promise<string> {
  const { db } = getFirebaseAdmin()
  
  const reservationId = generateReservationId()
  
  // Create reservation without strict schema validation to be more flexible
  const reservationData = {
    ...data,
    reservationId,
    status: data.status || "pending",
    paymentStatus: data.paymentStatus || "partial",
    documents: data.documents || [],
    notes: data.notes || null,
    callId: data.callId || null,
    platformConfirmationNumber: data.platformConfirmationNumber || null,
  }

  const docRef = db.collection("reservations").doc()
  
  await docRef.set({
    ...reservationData,
    history: [
      {
        action: "Reservation created",
        performedBy: data.agentId,
        timestamp: new Date(),
        details: `Created by ${data.agentName}`,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return docRef.id
}

export async function updateReservation(
  id: string,
  data: Partial<Omit<Reservation, "id" | "createdAt">>,
  performedBy: string,
  performedByName: string
): Promise<void> {
  const { db } = getFirebaseAdmin()
  
  const historyEntry = {
    action: "Reservation updated",
    performedBy,
    timestamp: new Date(),
    details: `Updated by ${performedByName}`,
  }

  await db.collection("reservations").doc(id).update({
    ...data,
    updatedAt: new Date(),
    history: [...(data.history || []), historyEntry],
  })
}

