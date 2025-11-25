"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { getFirebaseClient } from "@/lib/firebaseClient"

interface AuthContextType {
  user: FirebaseUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const { auth } = getFirebaseClient()
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user)
        
        // Update last login timestamp when user logs in
        if (user) {
          try {
            await fetch(`/api/users/${user.uid}/last-login`, {
              method: "POST",
            })
          } catch (error) {
            console.error("Error updating last login:", error)
          }
        }
        
        setLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error("Firebase client initialization error:", error)
      setError(error instanceof Error ? error.message : "Firebase initialization failed")
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { auth } = getFirebaseClient()
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { auth } = getFirebaseClient()
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user document in Firestore
    try {
      await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userCredential.user.uid,
          email: userCredential.user.email,
          name,
          role: "agent", // Default role, admin can change this later
        }),
      })
    } catch (error) {
      console.error("Error creating user document:", error)
      // Don't fail the signup if user document creation fails
      // The user can still login and we can create it later
    }
  }

  const signOut = async () => {
    const { auth } = getFirebaseClient()
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

