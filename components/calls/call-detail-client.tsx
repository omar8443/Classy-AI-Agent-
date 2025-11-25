"use client"

import { Call } from "@/types/calls"
import { Lead } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CallActions } from "@/components/calls/call-actions"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
        <Card>
          <CardHeader>
            <CardTitle>{lead?.name || call.callerName || "Call Information"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">{call.callerPhoneNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              {lead?.email ? (
                <a href={`mailto:${lead.email}`} className="font-medium text-primary hover:underline">
                  {lead.email}
                </a>
              ) : (
                <div className="font-medium text-muted-foreground">Not provided</div>
              )}
            </div>
            {call.labels.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground">Labels</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {call.labels.map((label) => (
                    <Badge key={label} variant="outline">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {call.assignedToName && (
              <div>
                <div className="text-sm text-muted-foreground">Assigned To</div>
                <div className="font-medium">{call.assignedToName}</div>
              </div>
            )}
            {call.audioUrl && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Audio</div>
                <audio controls className="w-full">
                  <source src={call.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {call.summary || "No summary available."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Full Transcript</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Complete conversation recording
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border-2 border-border bg-card p-6 max-h-[600px] overflow-y-auto">
            <p className="whitespace-pre-wrap text-base leading-relaxed tracking-wide">
              {formattedTranscript}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Agent Notes</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Internal notes and follow-up instructions
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Price Quoted by agent</label>
                <input
                  type="text"
                  defaultValue={lead?.quotedPrice?.toString() || ""}
                  className="w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="$0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Follow-up notes</label>
                <textarea
                  className="min-h-[240px] w-full resize-none rounded-lg border-2 border-input bg-background p-4 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Add notes..."
                  defaultValue={call.notes || ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Call Metadata</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Technical information
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Call ID</div>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{call.id}</code>
              </div>
              {call.durationSeconds && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Duration</div>
                  <div className="text-sm font-medium">
                    {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Provider</div>
                <div className="text-sm font-medium capitalize">{call.provider}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Status</div>
                <Badge>{call.status || "pending"}</Badge>
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

