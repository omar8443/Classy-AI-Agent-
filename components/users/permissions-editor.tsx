"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, UserPermissions } from "@/types/users"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

// Accept serialized user with string dates
type SerializedUser = Omit<User, "createdAt" | "updatedAt" | "lastLoginAt"> & {
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

interface PermissionsEditorProps {
  user: SerializedUser
}

const permissionLabels: Record<keyof UserPermissions, string> = {
  canViewDashboard: "View Dashboard",
  canManageLeads: "Manage Leads",
  canManageCalls: "Manage Calls",
  canCreateReservations: "Create Reservations",
  canManageReservations: "Manage Reservations",
  canManageUsers: "Manage Users",
  canAccessSettings: "Access Settings",
  canViewAnalytics: "View Analytics",
}

export function PermissionsEditor({ user }: PermissionsEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState(user.permissions)

  const handleToggle = (key: keyof UserPermissions) => {
    setPermissions({ ...permissions, [key]: !permissions[key] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      })

      if (!response.ok) throw new Error("Failed to update permissions")

      toast({
        title: "Permissions updated",
        description: "User permissions have been saved successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {Object.entries(permissionLabels).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={key} className="cursor-pointer">
              {label}
            </Label>
            <input
              type="checkbox"
              id={key}
              checked={permissions[key as keyof UserPermissions]}
              onChange={() => handleToggle(key as keyof UserPermissions)}
              className="h-4 w-4 rounded border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Permissions"}
      </Button>
    </form>
  )
}

