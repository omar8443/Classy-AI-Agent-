"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Call } from "@/types/calls"

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: Date
  endedAt: Date | null
}

interface CallsTableProps {
  calls: SerializedCall[]
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

  const handleArchive = async (id: string) => {
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

  const handleDelete = async (id: string) => {
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
      <div className="flex gap-4">
        <Input
          placeholder="Search by caller, phone, or transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredCalls.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {calls.length === 0 ? "No calls yet." : "No calls match your filters."}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="h-12 px-4 text-left align-middle font-medium">Date/Time</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Caller</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Phone</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Summary</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map((call) => {
                const summary = call.summary || (call.transcript ? `${call.transcript.slice(0, 120)}...` : "")
                return (
                  <tr
                    key={call.id}
                    onClick={() => router.push(`/calls/${call.id}`)}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 text-muted-foreground">{formatDistanceToNow(call.createdAt, { addSuffix: true })}</td>
                    <td className="p-4 font-medium">{call.callerName || "Unknown"}</td>
                    <td className="p-4 text-muted-foreground">{call.callerPhoneNumber}</td>
                    <td className="p-4 text-muted-foreground">
                      <div className="line-clamp-2">{summary}</div>
                    </td>
                    <td className="p-4" onClick={(event) => event.stopPropagation()}>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" disabled={archivingId === call.id} onClick={() => handleArchive(call.id)}>
                          {archivingId === call.id ? "Archiving…" : "Archive"}
                        </Button>
                        <Button size="sm" variant="destructive" disabled={deletingId === call.id} onClick={() => handleDelete(call.id)}>
                          {deletingId === call.id ? "Deleting…" : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

