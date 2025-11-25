"use client"

import { useAuth } from "@/lib/hooks/useAuth"

export function DashboardTopBar() {
  const { user } = useAuth()

  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-8">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="text-sm text-muted-foreground">
        {user?.email}
      </div>
    </div>
  )
}

