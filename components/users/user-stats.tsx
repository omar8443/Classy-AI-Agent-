"use client"

import { UserStats as UserStatsType } from "@/types/users"
import { Phone, Calendar, DollarSign, Clock } from "lucide-react"

interface UserStatsProps {
  stats: UserStatsType
}

export function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Total Calls</span>
        </div>
        <span className="font-semibold">{stats.totalCalls}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Reservations</span>
        </div>
        <span className="font-semibold">{stats.totalReservations}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Total Revenue</span>
        </div>
        <span className="font-semibold">${stats.totalRevenue.toLocaleString()}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Avg Call Duration</span>
        </div>
        <span className="font-semibold">{Math.round(stats.avgCallDuration)}s</span>
      </div>
    </div>
  )
}

