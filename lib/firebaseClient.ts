import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

export function getFirebaseClient() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client can only be used in browser context")
  }

  if (app && auth && db) {
    return { app, auth, db }
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  if (!config.apiKey || !config.authDomain || !config.projectId) {
    console.error("Missing Firebase configuration. Check your environment variables.")
    console.error("Current config:", config)
    throw new Error("Missing Firebase configuration. Please set up your .env.local file with valid Firebase credentials.")
  }

  if (getApps().length === 0) {
    app = initializeApp(config)
  } else {
    app = getApps()[0]
  }

  auth = getAuth(app)
  db = getFirestore(app)

  return { app, auth, db }
}

