import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { Call } from "@/types/calls"

export async function getCalls(limit?: number): Promise<Call[]> {
  const { db } = getFirebaseAdmin()
  let query = db.collection("calls").orderBy("createdAt", "desc")
  
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
      endedAt: data.endedAt?.toDate() || null,
      archived: data.archived ?? false,
    }
  }) as Call[]
}

export async function getCallsByLeadId(leadId: string): Promise<Call[]> {
  const { db } = getFirebaseAdmin()
  const snapshot = await db
    .collection("calls")
    .where("leadId", "==", leadId)
    .orderBy("createdAt", "desc")
    .get()
  
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      endedAt: data.endedAt?.toDate() || null,
      archived: data.archived ?? false,
    }
  }) as Call[]
}

export async function getCallById(id: string): Promise<Call | null> {
  const { db } = getFirebaseAdmin()
  const doc = await db.collection("calls").doc(id).get()
  
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
    endedAt: data.endedAt?.toDate() || null,
    archived: data.archived ?? false,
  } as Call
}

