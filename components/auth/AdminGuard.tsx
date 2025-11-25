"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/lib/hooks/usePermissions"

interface AdminGuardProps {
  children: React.ReactNode
  fallbackPath?: string
}

export function AdminGuard({ children, fallbackPath = "/" }: AdminGuardProps) {
  const router = useRouter()
  const { isAdmin, loading } = usePermissions()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push(fallbackPath)
    }
  }, [isAdmin, loading, router, fallbackPath])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}

