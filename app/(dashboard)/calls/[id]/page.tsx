import { notFound } from "next/navigation"
import { getCallById } from "@/lib/firestore/calls"
import { getLeadById } from "@/lib/firestore/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function CallDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const call = await getCallById(params.id)

  if (!call) {
    notFound()
  }

  const lead = call.leadId ? await getLeadById(call.leadId) : null
  const createdAt = call.createdAt instanceof Date 
    ? call.createdAt 
    : call.createdAt?.toDate?.() || new Date()

  const formattedTranscript = call.transcript
    ? call.transcript.replace(/ (\?|\!|:|;)/g, "\u00a0$1")
    : "No transcript available."

  return (
    <div className="space-y-8">
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
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </p>
        </div>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Full Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/40 p-4 max-h-[480px] overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {formattedTranscript}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Leave any follow-up instructions.</p>
              <div className="space-y-2 text-sm">
                <label className="font-medium text-foreground">Price Quoted by agent</label>
                <input
                  type="text"
                  defaultValue={lead?.quotedPrice?.toString() || ""}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="$0.00"
                />
              </div>
              <textarea
                className="min-h-[220px] w-full resize-none rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

