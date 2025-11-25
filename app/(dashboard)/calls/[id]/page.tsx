import { notFound } from "next/navigation"
import { getCallById } from "@/lib/firestore/calls"
import { getLeadById } from "@/lib/firestore/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
            <CardTitle>Call Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Caller</div>
              <div className="font-medium">{call.callerName || "Unknown"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">{call.callerPhoneNumber}</div>
            </div>
            {lead && (
              <div>
                <div className="text-sm text-muted-foreground">Lead</div>
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {lead.name || "Unknown"}
                </Link>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-medium">{formatDuration(call.durationSeconds)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sentiment</div>
              <Badge className={getSentimentColor(call.sentiment)}>
                {call.sentiment || "N/A"}
              </Badge>
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

      <Card>
        <CardHeader>
          <CardTitle>Full Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {call.transcript || "No transcript available."}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

