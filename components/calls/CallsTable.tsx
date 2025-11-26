"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { Phone, Archive, Trash2, Search, ChevronRight, User, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

// Couleurs pour les agents assignés
const agentColors: Record<string, string> = {
  default: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
}

function getAgentColor(agentName: string): string {
  // Génère une couleur basée sur le nom
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  ]
  const index = agentName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export function CallsTable({ calls: initialCalls }: CallsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [calls, setCalls] = useState(initialCalls)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Sync calls when props change (e.g., after navigation back from detail page)
  useEffect(() => {
    setCalls(initialCalls)
  }, [initialCalls])

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
          placeholder="Search calls by name, phone, or transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 max-w-md shadow-sm border-border/60 focus-visible:border-primary/50"
        />
      </div>

      {filteredCalls.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-base font-semibold mb-1">
            {calls.length === 0 ? "No calls yet" : "No matching calls"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {calls.length === 0 ? "Calls will appear here when they come in" : "Try adjusting your search query"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCalls.map((call) => {
            const createdAt = new Date(call.createdAt)
            const isUnassigned = !call.assignedTo
            
            return (
              <div
                key={call.id}
                onClick={() => router.push(`/calls/${call.id}`)}
                className={`group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  isUnassigned 
                    ? "bg-orange-50/50 dark:bg-orange-950/10 border-orange-200/60 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:shadow-sm" 
                    : "bg-card hover:bg-accent/30 hover:shadow-sm hover:border-border/80"
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                    isUnassigned ? "bg-orange-100 dark:bg-orange-900/30" : "bg-primary/10"
                  }`}>
                    <Phone className={`h-4 w-4 ${isUnassigned ? "text-orange-600 dark:text-orange-400" : "text-primary"}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-semibold text-sm">
                      {call.callerName || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatPhoneNumber(call.callerPhoneNumber)}
                    </span>
                    {/* Badge d'assignation */}
                    {call.assignedToName ? (
                      <Badge className={`text-xs font-medium px-2.5 py-0.5 ${getAgentColor(call.assignedToName)}`}>
                        <User className="h-3 w-3 mr-1" />
                        {call.assignedToName}
                      </Badge>
                    ) : (
                      <Badge className="text-xs font-medium px-2.5 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50">
                        Unassigned
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Time & Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right text-xs">
                    <div className="font-semibold flex items-center gap-1.5 justify-end text-foreground">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {formatDistanceToNow(createdAt, { addSuffix: true })}
                    </div>
                    <div className="text-muted-foreground font-medium">{format(createdAt, "MMM d, h:mm a")}</div>
                  </div>
                  
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-accent"
                      disabled={archivingId === call.id}
                      onClick={(e) => handleArchive(call.id, e)}
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deletingId === call.id}
                      onClick={(e) => handleDelete(call.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

