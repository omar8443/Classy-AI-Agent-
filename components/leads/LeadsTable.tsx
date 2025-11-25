"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

import { Lead, LeadStatus } from "@/types/leads"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeadsTableProps {
  leads: Lead[]
}

const statusOptions: LeadStatus[] = ["new", "in_progress", "booked", "closed", "lost"]

export function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [statusValues, setStatusValues] = useState<Record<string, LeadStatus>>(() =>
    Object.fromEntries(initialLeads.map((lead) => [lead.id, lead.status]))
  )

  const filteredLeads = initialLeads.filter((lead) => {
    const normalizedQuery = searchQuery.toLowerCase()
    const matchesSearch =
      searchQuery === "" ||
      lead.name?.toLowerCase().includes(normalizedQuery) ||
      lead.phoneNumber.includes(searchQuery) ||
      lead.email?.toLowerCase().includes(normalizedQuery)
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          {initialLeads.length === 0 ? "No leads yet." : "No leads match your filters."}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Phone</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Last Call</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Total Calls</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const updatedAt = lead.updatedAt instanceof Date ? lead.updatedAt : (lead.updatedAt?.toDate?.() || new Date())
                return (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 font-medium">{lead.name || "Unknown"}</td>
                    <td className="p-4 text-muted-foreground">{lead.phoneNumber}</td>
                    <td className="p-4 text-muted-foreground">
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-foreground underline decoration-dotted underline-offset-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {lead.email}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </td>
                    <td className="p-4" onClick={(event) => event.stopPropagation()}>
                      <Select
                        value={statusValues[lead.id] || lead.status}
                        onValueChange={(value) =>
                          setStatusValues((prev) => ({
                            ...prev,
                            [lead.id]: value as LeadStatus,
                          }))
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {lead.lastCallId ? formatDistanceToNow(updatedAt, { addSuffix: true }) : "Never"}
                    </td>
                    <td className="p-4 text-muted-foreground">{lead.totalCalls}</td>
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

