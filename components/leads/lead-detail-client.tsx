"use client"

import { Lead } from "@/types/leads"
import { Call } from "@/types/calls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LeadDetailForm } from "@/components/leads/LeadDetailForm"
import { CallsList } from "@/components/calls/CallsList"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ArrowLeft, Phone, Mail } from "lucide-react"
import { statusColors } from "@/lib/constants"

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: Date
  updatedAt: Date
}

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: Date
  endedAt: Date | null
}

interface LeadDetailClientProps {
  lead: SerializedLead
  calls: SerializedCall[]
  latestSummary: string | null
  latestCallTimestamp: Date | null
}

export function LeadDetailClient({
  lead,
  calls,
  latestSummary,
  latestCallTimestamp,
}: LeadDetailClientProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/leads"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{lead.name || "Unknown Lead"}</h1>
          <p className="text-muted-foreground mt-2">Lead details and call history</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadDetailForm lead={lead} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Status</div>
                <Badge className={statusColors[lead.status] || statusColors.new}>
                  {lead.status.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </div>
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="font-medium text-primary hover:underline text-lg"
                >
                  {lead.phoneNumber}
                </a>
              </div>
              {lead.email && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <a
                    href={`mailto:${lead.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Source</div>
                <div className="font-medium">{lead.source}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Calls</div>
                <div className="text-2xl font-bold">{lead.totalCalls}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium">
                  {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Call Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {latestSummary ? (
                <>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {latestCallTimestamp
                      ? formatDistanceToNow(latestCallTimestamp, { addSuffix: true })
                      : "Recent activity"}
                  </p>
                  <p className="rounded-xl border border-muted bg-muted/20 p-4 text-base text-foreground">
                    {latestSummary}
                  </p>
                </>
              ) : (
                <p>No calls logged for this lead yet. Once a call is recorded, its summary will appear here.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <CallsList calls={calls} />
        </CardContent>
      </Card>
    </div>
  )
}

