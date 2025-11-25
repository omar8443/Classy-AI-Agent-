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

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: Date
  endedAt: Date | null
}

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: Date
  updatedAt: Date
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
              {formatDistanceToNow(call.createdAt, { addSuffix: true })}
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

      <Card className="border-t-4 border-t-gradient-to-r from-primary to-blue-500">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Conversation Transcript
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Full conversation between agent and caller • iMessage style
          </p>
        </CardHeader>
        <CardContent className="p-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-background">
          <TranscriptViewer transcript={call.transcript} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="border-b bg-gradient-to-r from-amber-500/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Agent Notes
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Internal notes and follow-up instructions
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  Price Quoted by agent
                </label>
                <input
                  type="text"
                  defaultValue={lead?.quotedPrice?.toString() || ""}
                  className="w-full rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  placeholder="$0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Follow-up notes</label>
                <textarea
                  className="min-h-[240px] w-full resize-none rounded-lg border-2 border-input bg-background p-4 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  placeholder="Add notes..."
                  defaultValue={call.notes || ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-500">
          <CardHeader className="border-b bg-gradient-to-r from-slate-500/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              Call Metadata
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Technical information
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950/30 p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Call ID</div>
                <code className="text-sm font-mono font-semibold">{call.id}</code>
              </div>
              {call.durationSeconds && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Duration</div>
                  <div className="text-lg font-bold text-primary">
                    {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Provider</div>
                <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 capitalize">
                  {call.provider}
                </Badge>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Status</div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {call.status || "pending"}
                </Badge>
              </div>
              {call.direction && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Direction</div>
                  <Badge variant="outline" className="capitalize">{call.direction}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

