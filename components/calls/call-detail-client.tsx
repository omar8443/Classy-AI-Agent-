"use client"

import { Call } from "@/types/calls"
import { Lead } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CallActions } from "@/components/calls/call-actions"
import { TranscriptViewer } from "@/components/calls/transcript-viewer"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"

// Serialized types for client components
export type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: string
  endedAt: string | null
}

export type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
} | null

interface CallDetailClientProps {
  call: SerializedCall
  lead: SerializedLead
  formattedTranscript: string
}

export function CallDetailClient({ call, lead, formattedTranscript }: CallDetailClientProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/calls"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Call Details</h1>
            <p className="text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <CallActions call={call} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              {lead?.name || call.callerName || "Caller"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{call.callerPhoneNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              {lead?.email ? (
                <a href={`mailto:${lead.email}`} className="font-medium text-primary hover:underline">
                  {lead.email}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            {call.assignedToName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Assigned</span>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {call.assignedToName}
                </Badge>
              </div>
            )}
            {call.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {call.labels.map((label) => (
                  <Badge key={label} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
            {call.audioUrl && (
              <div className="pt-2">
                <audio controls className="w-full h-8">
                  <source src={call.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {call.summary || "No summary available."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversation Transcript */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TranscriptViewer transcript={call.transcript} />
          </CardContent>
        </Card>

        {/* Agent Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Agent Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Price Quoted
              </label>
              <input
                type="text"
                defaultValue={lead?.quotedPrice?.toString() || ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="$0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <textarea
                className="min-h-[200px] w-full resize-none rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add notes..."
                defaultValue={call.notes || ""}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

