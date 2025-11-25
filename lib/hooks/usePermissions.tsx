"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./useAuth"
import { User, UserPermissions } from "@/types/users"

export function usePermissions() {
  const { user: firebaseUser } = useAuth()
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserPermissions() {
      if (!firebaseUser) {
        setPermissions(null)
        setRole(null)
        setLoading(false)
        return
      }

      try {
        // Get custom claims from Firebase token
        const tokenResult = await firebaseUser.getIdTokenResult()
        const userRole = tokenResult.claims.role as string | undefined

        // Fetch full user document from Firestore
        const response = await fetch(`/api/users/${firebaseUser.uid}`)
        if (response.ok) {
          const userData: User = await response.json()
          setPermissions(userData.permissions)
          setRole(userData.role)
        } else {
          // Fallback: use default permissions based on role from custom claims
          setRole(userRole || "viewer")
          setPermissions(null)
        }
      } catch (error) {
        console.error("Error fetching user permissions:", error)
        setPermissions(null)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPermissions()
  }, [firebaseUser])

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!permissions) return false
    return permissions[permission]
  }

  const isAdmin = role === "admin"
  const isManager = role === "manager"
  const isAgent = role === "agent"
  const isViewer = role === "viewer"

  return {
    permissions,
    role,
    loading,
    hasPermission,
    isAdmin,
    isManager,
    isAgent,
    isViewer,
  }
}

