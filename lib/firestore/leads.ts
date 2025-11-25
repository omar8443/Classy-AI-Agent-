import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { Lead, LeadStatus } from "@/types/leads"

export async function getLeads(): Promise<Lead[]> {
  const { db } = getFirebaseAdmin()
  const snapshot = await db.collection("leads").orderBy("createdAt", "desc").get()
  
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    }
  }) as Lead[]
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const { db } = getFirebaseAdmin()
  const doc = await db.collection("leads").doc(id).get()
  
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
  } as Lead
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const { db } = getFirebaseAdmin()
  await db.collection("leads").doc(id).update({
    status,
    updatedAt: new Date(),
  })
}

export async function updateLeadNotes(id: string, notes: string): Promise<void> {
  const { db } = getFirebaseAdmin()
  await db.collection("leads").doc(id).update({
    notes,
    updatedAt: new Date(),
  })
}

export async function updateLeadEmail(id: string, email: string | null): Promise<void> {
  const { db } = getFirebaseAdmin()
  await db.collection("leads").doc(id).update({
    email,
    updatedAt: new Date(),
  })
}

