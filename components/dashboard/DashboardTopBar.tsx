"use client"

import { useAuth } from "@/lib/hooks/useAuth"
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
    <div className="flex items-center justify-between bg-transparent px-6 py-4">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Voyages Classy Travel AI</h2>
        <p className="text-xs text-neutral-400">{formattedDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium tracking-wide text-neutral-600 px-3 py-1.5 rounded-xl bg-white border border-neutral-100" style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", fontVariantNumeric: 'tabular-nums' }}>
          {currentTime}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-green-700">Live</span>
        </div>
        <div className="text-sm text-neutral-600 font-medium px-3 py-1.5 rounded-xl bg-white border border-neutral-100">{user?.email || "team@classyai.com"}</div>
      </div>
    </div>
  )
}

