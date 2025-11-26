"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { Phone, Trash2, Search, ChevronRight, User, Clock } from "lucide-react"

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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search calls by name, phone, or transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 max-w-md bg-white rounded-xl border-neutral-100 text-neutral-900 placeholder:text-neutral-300 focus-visible:ring-1 focus-visible:ring-neutral-900"
        />
      </div>

      {filteredCalls.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl">
          <div className="mx-auto h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-base font-semibold mb-1 text-neutral-900">
            {calls.length === 0 ? "No calls yet" : "No matching calls"}
          </h3>
          <p className="text-sm text-neutral-400">
            {calls.length === 0 ? "Calls will appear here when they come in" : "Try adjusting your search query"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCalls.map((call) => {
            const createdAt = new Date(call.createdAt)
            const isUnassigned = !call.assignedTo
            
            return (
              <div
                key={call.id}
                className="group flex items-center gap-4 px-5 py-4 bg-white border border-neutral-100 rounded-xl hover:border-neutral-200 hover:shadow-sm transition-all"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    isUnassigned ? "bg-orange-100" : "bg-neutral-100"
                  }`}>
                    <Phone className={`h-4 w-4 ${isUnassigned ? "text-orange-600" : "text-neutral-600"}`} />
                  </div>
                </div>

                {/* Content */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => router.push(`/calls/${call.id}`)}
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-semibold text-sm text-neutral-900">
                      {call.callerName || "Unknown"}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">
                      {formatPhoneNumber(call.callerPhoneNumber)}
                    </span>
                    {/* Badge d'assignation */}
                    {call.assignedToName ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-900 border border-neutral-200">
                        <User className="h-3 w-3" />
                        {call.assignedToName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 border border-orange-200">
                        Unassigned
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                    <span>•</span>
                    <span>{format(createdAt, "MMM d, h:mm a")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isUnassigned && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Implement assign to me functionality
                        console.log("Assign to me:", call.id)
                      }}
                    >
                      Assign to me
                    </Button>
                  )}
                  
                  <button
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-neutral-100 hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-all"
                    disabled={deletingId === call.id}
                    onClick={(e) => handleDelete(call.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => router.push(`/calls/${call.id}`)}
                    className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

