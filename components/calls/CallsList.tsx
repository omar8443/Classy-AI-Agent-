"use client"

import Link from "next/link"
import { Call } from "@/types/calls"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface CallsListProps {
  calls: Call[]
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "N/A"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function getSentimentColor(sentiment: string | null): string {
  switch (sentiment) {
    case "positive":
      return "bg-green-100 text-green-800 border-green-200"
    case "negative":
      return "bg-red-100 text-red-800 border-red-200"
    case "neutral":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function CallsList({ calls }: CallsListProps) {
  if (calls.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No calls yet.</div>
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => {
        const createdAt = call.createdAt instanceof Date ? call.createdAt : new Date(call.createdAt)
        return (
          <Link
            key={call.id}
            href={`/calls/${call.id}`}
            className="block rounded-lg border p-4 transition-colors hover:bg-accent"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </span>
                  <Badge className={getSentimentColor(call.sentiment)}>
                    {call.sentiment || "N/A"}
                  </Badge>
                  {call.durationSeconds && (
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(call.durationSeconds)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {call.summary || call.transcript.slice(0, 150) + "..."}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

