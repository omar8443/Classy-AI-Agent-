import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { User, UserSchema, UserRole, defaultPermissions } from "@/types/users"
import type { QueryDocumentSnapshot } from "firebase-admin/firestore"

/**
 * Create a new user document in Firestore with custom claims
 */
export async function createUserDocument(
  userId: string,
  email: string,
  name: string,
  role: UserRole = "agent"
): Promise<void> {
  const { db, auth } = getFirebaseAdmin()
  
  const userData = UserSchema.parse({
    email,
    name,
    role,
    permissions: defaultPermissions[role],
    avatar: null,
    phone: null,
    stats: {
      totalCalls: 0,
      totalReservations: 0,
      totalRevenue: 0,
      avgCallDuration: 0,
    },
    preferences: {
      theme: "system",
      language: "fr",
      notifications: {
        email: true,
        push: false,
        newLead: true,
        newReservation: true,
      },
    },
  })

  // Set custom claims for role-based access
  await auth.setCustomUserClaims(userId, { role })

  await db.collection("users").doc(userId).set({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

/**
 * Get user document by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { db } = getFirebaseAdmin()
  const userDoc = await db.collection("users").doc(userId).get()

  if (!userDoc.exists) {
    return null
  }

  return {
    id: userDoc.id,
    ...userDoc.data(),
  } as User
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  const { db } = getFirebaseAdmin()
  const snapshot = await db.collection("users").orderBy("createdAt", "desc").get()

  return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
    id: doc.id,
    ...doc.data(),
  })) as User[]
}

/**
 * Update user document
 */
export async function updateUser(
  userId: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> {
  const { db } = getFirebaseAdmin()
  
  await db.collection("users").doc(userId).update({
    ...data,
    updatedAt: new Date(),
  })
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await getUserById(userId)
  return user?.role === "admin"
}

/**
 * Update user role and custom claims
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const { db, auth } = getFirebaseAdmin()
  
  // Update custom claims
  await auth.setCustomUserClaims(userId, { role })
  
  // Update Firestore document
  await db.collection("users").doc(userId).update({
    role,
    permissions: defaultPermissions[role],
    updatedAt: new Date(),
  })
}

/**
 * Update user permissions
 */
export async function updateUserPermissions(
  userId: string,
  permissions: Partial<User["permissions"]>
): Promise<void> {
  const { db } = getFirebaseAdmin()
  const user = await getUserById(userId)
  
  if (!user) {
    throw new Error("User not found")
  }

  await db.collection("users").doc(userId).update({
    permissions: { ...user.permissions, ...permissions },
    updatedAt: new Date(),
  })
}

/**
 * Update user stats
 */
export async function updateUserStats(
  userId: string,
  stats: Partial<User["stats"]>
): Promise<void> {
  const { db } = getFirebaseAdmin()
  const user = await getUserById(userId)
  
  if (!user) {
    throw new Error("User not found")
  }

  await db.collection("users").doc(userId).update({
    stats: { ...user.stats, ...stats },
    updatedAt: new Date(),
  })
}

