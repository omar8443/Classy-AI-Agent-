"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && !error) {
      router.push("/login")
    }
  }, [user, loading, error, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Firebase Configuration Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm font-semibold mb-2">To fix this:</p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal ml-4">
              <li>Go to Firebase Console and get your web app credentials</li>
              <li>Update the values in your <code className="bg-gray-100 px-1 rounded">.env.local</code> file</li>
              <li>Restart the development server</li>
            </ol>
          </div>
          <a 
            href="https://console.firebase.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Open Firebase Console
          </a>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

