"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Phone, Archive, Trash2, Search, ChevronRight, User } from "lucide-react"

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
          className="pl-10 max-w-sm"
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
            const isUnassigned = !call.assignedTo
            
            return (
              <div
                key={call.id}
                onClick={() => router.push(`/calls/${call.id}`)}
                className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isUnassigned 
                    ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30" 
                    : "bg-card hover:bg-accent/50"
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    isUnassigned ? "bg-orange-200 dark:bg-orange-800" : "bg-primary/10"
                  }`}>
                    <Phone className={`h-4 w-4 ${isUnassigned ? "text-orange-600 dark:text-orange-300" : "text-primary"}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {call.callerName || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatPhoneNumber(call.callerPhoneNumber)}
                    </span>
                    {/* Badge d'assignation */}
                    {call.assignedToName ? (
                      <Badge className={`text-xs ${getAgentColor(call.assignedToName)}`}>
                        <User className="h-3 w-3 mr-1" />
                        {call.assignedToName}
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        Unassigned
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Time & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right text-xs">
                    <div className="font-medium">{format(createdAt, "MMM d")}</div>
                    <div className="text-muted-foreground">{format(createdAt, "h:mm a")}</div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={archivingId === call.id}
                      onClick={(e) => handleArchive(call.id, e)}
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      disabled={deletingId === call.id}
                      onClick={(e) => handleDelete(call.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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

