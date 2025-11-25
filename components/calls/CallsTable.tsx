"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { Phone, Archive, Trash2, Search, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Call } from "@/types/calls"

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: string
  endedAt: string | null
}

interface CallsTableProps {
  calls: SerializedCall[]
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function CallsTable({ calls: initialCalls }: CallsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [calls, setCalls] = useState(initialCalls)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredCalls = calls
    .filter((call) => !call.archived)
    .filter((call) => {
      const matchesSearch =
        searchQuery === "" ||
        call.callerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.callerPhoneNumber.includes(searchQuery) ||
        call.transcript.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setArchivingId(id)
    try {
      const response = await fetch(`/api/calls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to archive call")
      }

      setCalls((prev) => prev.map((call) => (call.id === id ? { ...call, archived: true } : call)))
      toast({ title: "Call archived", description: "The call has been moved to your archive." })
    } catch (error) {
      console.error(error)
      toast({ title: "Archive failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setArchivingId(null)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
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

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search calls..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {filteredCalls.length === 0 ? (
        <div className="py-16 text-center">
          <Phone className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            {calls.length === 0 ? "No calls yet" : "No calls match your search"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCalls.map((call) => {
            const createdAt = new Date(call.createdAt)
            const summary = call.summary || (call.transcript ? call.transcript.slice(0, 100) + "..." : "No summary")
            
            return (
              <div
                key={call.id}
                onClick={() => router.push(`/calls/${call.id}`)}
                className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {call.callerName || "Unknown Caller"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatPhoneNumber(call.callerPhoneNumber)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {summary}
                  </p>
                </div>

                {/* Time & Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">
                      {format(createdAt, "MMM d")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(createdAt, "h:mm a")}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      disabled={archivingId === call.id}
                      onClick={(e) => handleArchive(call.id, e)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deletingId === call.id}
                      onClick={(e) => handleDelete(call.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

