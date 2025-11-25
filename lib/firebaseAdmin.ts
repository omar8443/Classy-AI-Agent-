import { initializeApp, getApps, cert, App } from "firebase-admin/app"
import { getFirestore, Firestore } from "firebase-admin/firestore"
import { getAuth, Auth } from "firebase-admin/auth"

let app: App | undefined
let db: Firestore | undefined
let auth: Auth | undefined

export function getFirebaseAdmin() {
  if (app && db && auth) {
    return { app, db, auth }
  }

  if (getApps().length > 0) {
    app = getApps()[0]
    db = getFirestore(app)
    auth = getAuth(app)
    return { app, db, auth }
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set")
  }

  let serviceAccount: object

  try {
    // Try parsing as JSON string first
    serviceAccount = JSON.parse(serviceAccountKey)
  } catch {
    try {
      // Try parsing as base64
      const decoded = Buffer.from(serviceAccountKey, "base64").toString("utf-8")
      serviceAccount = JSON.parse(decoded)
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON or base64-encoded JSON")
    }
  }

  app = initializeApp({
    credential: cert(serviceAccount as { projectId: string; privateKey: string; clientEmail: string }),
  })

  db = getFirestore(app)
  auth = getAuth(app)

  return { app, db, auth }
}

