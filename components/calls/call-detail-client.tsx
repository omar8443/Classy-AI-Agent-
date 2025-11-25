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
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              {lead?.name || call.callerName || "Caller Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Phone</div>
              <div className="font-medium text-lg">{call.callerPhoneNumber}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Email</div>
              {lead?.email ? (
                <a href={`mailto:${lead.email}`} className="font-medium text-blue-500 hover:underline">
                  {lead.email}
                </a>
              ) : (
                <div className="font-medium text-muted-foreground">Not provided</div>
              )}
            </div>
            {call.labels.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Labels</div>
                <div className="flex flex-wrap gap-2">
                  {call.labels.map((label) => (
                    <Badge key={label} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {call.assignedToName && (
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Assigned To</div>
                <div className="font-medium">{call.assignedToName}</div>
              </div>
            )}
            {call.audioUrl && (
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Audio Recording</div>
                <audio controls className="w-full">
                  <source src={call.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-4 border border-purple-200 dark:border-purple-800">
              <p className="text-sm leading-relaxed">
                {call.summary || "No summary available."}
              </p>
            </div>
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

