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
    <div className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6 py-3.5">
      <div>
        <h2 className="text-lg font-bold">Classy AI</h2>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium tracking-wide text-muted-foreground px-3 py-1.5 rounded-md bg-muted/50" style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", fontVariantNumeric: 'tabular-nums' }}>
          {currentTime}
        </div>
        <ThemeToggle />
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
          Live
        </Badge>
        <div className="text-sm text-muted-foreground font-medium px-3 py-1.5 rounded-md bg-muted/50">{user?.email || "team@classyai.com"}</div>
      </div>
    </div>
  )
}

