"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useState, useEffect } from "react"

export function DashboardTopBar() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState("")
  
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date())

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-8 py-4">
      <div>
        <h2 className="text-xl font-semibold">Classy AI</h2>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-light tracking-wide text-muted-foreground" style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", fontVariantNumeric: 'tabular-nums' }}>
          {currentTime}
        </div>
        <ThemeToggle />
        <Badge>Live</Badge>
        <div className="text-sm text-muted-foreground">{user?.email || "team@classyai.com"}</div>
      </div>
    </div>
  )
}

