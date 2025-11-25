"use client"

import { useState } from "react"
import Link from "next/link"
import { Lead } from "@/types/leads"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"
import { statusColors } from "@/lib/constants"

interface LeadsTableProps {
  leads: Lead[]
}

export function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredLeads = initialLeads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phoneNumber.includes(searchQuery)
    
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
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {initialLeads.length === 0 ? "No leads yet." : "No leads match your filters."}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Phone</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Source</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Last Call</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Total Calls</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const updatedAt = lead.updatedAt instanceof Date ? lead.updatedAt : new Date(lead.updatedAt)
                return (
                  <tr
                    key={lead.id}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <td className="p-4">
                      <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                        {lead.name || "Unknown"}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{lead.phoneNumber}</td>
                    <td className="p-4">
                      <Badge className={statusColors[lead.status] || statusColors.new}>
                        {lead.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{lead.source}</td>
                    <td className="p-4 text-muted-foreground">
                      {lead.lastCallId
                        ? formatDistanceToNow(updatedAt, { addSuffix: true })
                        : "Never"}
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

