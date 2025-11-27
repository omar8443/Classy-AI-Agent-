import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { Call } from "@/types/calls"
import type { QueryDocumentSnapshot } from "firebase-admin/firestore"

export async function getCalls(limit?: number): Promise<Call[]> {
  const { db } = getFirebaseAdmin()
  let query = db.collection("calls").orderBy("createdAt", "desc")
  
  if (limit) {
    query = query.limit(limit) as any
  }
  
  const snapshot = await query.get()
  
  return snapshot.docs.map((doc: QueryDocumentSnapshot) => {
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
  
  return snapshot.docs.map((doc: QueryDocumentSnapshot) => {
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

export async function getAssignedCalls(userId?: string, isAdmin?: boolean): Promise<Call[]> {
  const { db } = getFirebaseAdmin()
  
  if (!isAdmin && userId) {
    // For non-admin users, get only their assigned calls
    const query = db.collection("calls")
      .where("assignedTo", "==", userId)
      .orderBy("createdAt", "desc") as any
    
    const snapshot = await query.get()
    
    return snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        endedAt: data.endedAt?.toDate() || null,
        archived: data.archived ?? false,
      }
    }) as Call[]
  } else if (isAdmin) {
    // For admin, get all calls and filter in-memory to avoid complex index
    const query = db.collection("calls")
      .orderBy("createdAt", "desc") as any
    
    const snapshot = await query.get()
    
    // Filter for calls that have an assignedTo value
    return snapshot.docs
      .filter((doc: QueryDocumentSnapshot) => {
        const data = doc.data()
        return data.assignedTo && data.assignedTo !== null && data.assignedTo !== ""
      })
      .map((doc: QueryDocumentSnapshot) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          endedAt: data.endedAt?.toDate() || null,
          archived: data.archived ?? false,
        }
      }) as Call[]
  } else {
    // No user specified and not admin - return empty
    return []
  }
}


