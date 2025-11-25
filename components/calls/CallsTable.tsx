"use client"

import { useState } from "react"
import Link from "next/link"
import { Call } from "@/types/calls"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDistanceToNow } from "date-fns"

interface CallsTableProps {
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

export function CallsTable({ calls: initialCalls }: CallsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState<string>("all")

  const filteredCalls = initialCalls.filter((call) => {
    const matchesSearch =
      searchQuery === "" ||
      call.callerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.callerPhoneNumber.includes(searchQuery) ||
      call.transcript.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSentiment = sentimentFilter === "all" || call.sentiment === sentimentFilter

    return matchesSearch && matchesSentiment
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by caller, phone, or transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCalls.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {initialCalls.length === 0 ? "No calls yet." : "No calls match your filters."}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Date/Time</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Caller</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Phone</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Summary</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Sentiment</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map((call) => {
                const createdAt = call.createdAt instanceof Date ? call.createdAt : new Date(call.createdAt)
                return (
                  <tr
                    key={call.id}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <td className="p-4">
                      <Link href={`/calls/${call.id}`} className="hover:underline">
                        {formatDistanceToNow(createdAt, { addSuffix: true })}
                      </Link>
                    </td>
                    <td className="p-4 font-medium">{call.callerName || "Unknown"}</td>
                    <td className="p-4 text-muted-foreground">{call.callerPhoneNumber}</td>
                    <td className="p-4 text-muted-foreground max-w-md">
                      <div className="line-clamp-2">
                        {call.summary || call.transcript.slice(0, 100) + "..."}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getSentimentColor(call.sentiment)}>
                        {call.sentiment || "N/A"}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDuration(call.durationSeconds)}
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

