import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { User, UserSchema } from "@/types/users"

/**
 * Create a new user document in Firestore
 */
export async function createUserDocument(
  userId: string,
  email: string,
  name: string,
  role: "admin" | "agent" | "viewer" = "agent"
): Promise<void> {
  const { db } = getFirebaseAdmin()
  
  const userData = UserSchema.parse({
    email,
    name,
    role,
    photoUrl: null,
    phoneNumber: null,
    isActive: true,
  })

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

  return snapshot.docs.map((doc) => ({
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
