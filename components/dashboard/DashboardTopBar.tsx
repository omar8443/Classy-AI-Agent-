"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { Badge } from "@/components/ui/badge"

export function DashboardTopBar() {
  const { user } = useAuth()
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date())

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Classy AI</h2>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge>Live</Badge>
        <div className="text-sm text-muted-foreground">{user?.email || "team@classyai.com"}</div>
      </div>
    </div>
  )
}

