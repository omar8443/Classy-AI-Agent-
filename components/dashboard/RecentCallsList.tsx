"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SerializedCall {
  id: string
  callerName: string | null
  callerPhoneNumber: string
  transcript: string
  summary: string | null
  assignedTo: string | null
  assignedToName: string | null
  archived: boolean
  createdAt: string
  endedAt: string | null
}

interface RecentCallsListProps {
  initialCalls: SerializedCall[]
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function RecentCallsList({ initialCalls }: RecentCallsListProps) {
  const [calls, setCalls] = useState(initialCalls)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm("Delete this call permanently?")) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/calls/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete call")
      }

      setCalls((prev) => prev.filter((call) => call.id !== id))
      toast({ title: "Call deleted", description: "The call record has been removed." })
    } catch (error) {
      console.error(error)
      toast({ title: "Delete failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  if (calls.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-400">
        No calls yet. Calls will appear here once webhooks are received.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {calls.map((call) => {
        const createdAt = new Date(call.createdAt)
        const preview =
          call.summary || (call.transcript ? `${call.transcript.slice(0, 120)}...` : "Awaiting transcript")
        
        return (
          <Link
            key={call.id}
            href={`/calls/${call.id}`}
            className="group flex items-start justify-between px-5 py-4 bg-white border border-neutral-100 rounded-xl hover:border-neutral-200 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Avatar circle */}
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-600 flex-shrink-0">
                {getInitials(call.callerName)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-neutral-900">
                    {call.callerName || "Unknown Caller"}
                  </p>
                  <span className="text-sm text-neutral-400">•</span>
                  <p className="text-sm text-neutral-400">
                    {formatPhoneNumber(call.callerPhoneNumber || "No number")}
                  </p>
                </div>
                
                {/* Summary/Preview */}
                <p className="text-sm text-neutral-500 line-clamp-2 mb-2">
                  {preview}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                  {call.assignedToName && (
                    <>
                      <span>•</span>
                      <span>{call.assignedToName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Delete button */}
            <button
              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-neutral-100 hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-all flex-shrink-0 ml-4"
              disabled={deletingId === call.id}
              onClick={(e) => handleDelete(call.id, e)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Link>
        )
      })}
    </div>
  )
}

