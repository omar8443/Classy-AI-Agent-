import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { Reservation, ReservationSchema, generateReservationId } from "@/types/reservation"

export async function getReservations(limit?: number): Promise<Reservation[]> {
  const { db } = getFirebaseAdmin()
  let query = db.collection("reservations").orderBy("createdAt", "desc")
  
  if (limit) {
    query = query.limit(limit) as any
  }
  
  const snapshot = await query.get()
  
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      travelDetails: {
        ...data.travelDetails,
        departureDate: data.travelDetails?.departureDate?.toDate() || new Date(),
        returnDate: data.travelDetails?.returnDate?.toDate() || new Date(),
      },
      documents: data.documents?.map((doc: any) => ({
        ...doc,
        uploadedAt: doc.uploadedAt?.toDate() || new Date(),
      })) || [],
      history: data.history?.map((entry: any) => ({
        ...entry,
        timestamp: entry.timestamp?.toDate() || new Date(),
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
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    travelDetails: {
      ...data.travelDetails,
      departureDate: data.travelDetails?.departureDate?.toDate() || new Date(),
      returnDate: data.travelDetails?.returnDate?.toDate() || new Date(),
    },
    documents: data.documents?.map((doc: any) => ({
      ...doc,
      uploadedAt: doc.uploadedAt?.toDate() || new Date(),
    })) || [],
    history: data.history?.map((entry: any) => ({
      ...entry,
      timestamp: entry.timestamp?.toDate() || new Date(),
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
  
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      travelDetails: {
        ...data.travelDetails,
        departureDate: data.travelDetails?.departureDate?.toDate() || new Date(),
        returnDate: data.travelDetails?.returnDate?.toDate() || new Date(),
      },
      documents: data.documents?.map((doc: any) => ({
        ...doc,
        uploadedAt: doc.uploadedAt?.toDate() || new Date(),
      })) || [],
      history: data.history?.map((entry: any) => ({
        ...entry,
        timestamp: entry.timestamp?.toDate() || new Date(),
      })) || [],
    }
  }) as Reservation[]
}

export async function createReservation(
  data: Omit<Reservation, "id" | "reservationId" | "createdAt" | "updatedAt" | "history">
): Promise<string> {
  const { db } = getFirebaseAdmin()
  
  const reservationId = generateReservationId()
  
  const reservationData = ReservationSchema.parse({
    ...data,
    reservationId,
  })

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

