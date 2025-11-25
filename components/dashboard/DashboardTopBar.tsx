"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export function DashboardTopBar() {
  const { user } = useAuth()
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="flex items-center justify-between border-b border-border bg-card pr-8 pl-4 h-[85px]">
      <div className="flex-1">
        <p className="text-lg font-semibold">{formattedDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Badge>Live</Badge>
        <div className="text-sm text-muted-foreground">{user?.email || "team@classyai.com"}</div>
      </div>
    </div>
  )
}

