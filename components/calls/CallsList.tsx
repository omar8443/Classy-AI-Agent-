"use client"

import Link from "next/link"
import { Call } from "@/types/calls"
import { formatDistanceToNow } from "date-fns"

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: string
  endedAt: string | null
}

interface CallsListProps {
  calls: SerializedCall[]
}

export function CallsList({ calls }: CallsListProps) {
  if (calls.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No calls yet.</div>
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => {
        const createdAt = call.createdAt
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
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                  </span>
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

