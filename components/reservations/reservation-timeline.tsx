"use client"

import { ReservationHistoryEntry } from "@/types/reservation"
import { formatDistanceToNow } from "date-fns"

type SerializedHistoryEntry = Omit<ReservationHistoryEntry, "timestamp"> & {
  timestamp: string
}

interface ReservationTimelineProps {
  history: SerializedHistoryEntry[]
}

export function ReservationTimeline({ history }: ReservationTimelineProps) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet</p>
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div key={index} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
            {index < history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium">{entry.action}</p>
            {entry.details && (
              <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

