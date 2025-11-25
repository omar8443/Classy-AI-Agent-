"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { getFirebaseClient } from "@/lib/firebaseClient"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const { auth } = getFirebaseClient()
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
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

  const signUp = async (email: string, password: string) => {
    const { auth } = getFirebaseClient()
    await createUserWithEmailAndPassword(auth, email, password)
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

