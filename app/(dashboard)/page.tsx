import { getLeads } from "@/lib/firestore/leads"
import { getCalls } from "@/lib/firestore/calls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Phone, Users, TrendingUp, Clock } from "lucide-react"

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

export default async function DashboardPage() {
  const [leads, calls] = await Promise.all([getLeads(), getCalls(10)])

  const totalLeads = leads.length
  const newLeadsThisWeek = leads.filter((lead) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const createdAt = lead.createdAt instanceof Date ? lead.createdAt : new Date(lead.createdAt)
    return createdAt >= weekAgo
  }).length
  const totalCalls = calls.length
  const bookedLeads = leads.filter((lead) => lead.status === "booked").length
  const conversionRate = totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : "0"

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads.toString(),
      icon: Users,
      description: `${newLeadsThisWeek} new this week`,
    },
    {
      title: "Total Calls",
      value: totalCalls.toString(),
      icon: Phone,
      description: "All time",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      description: `${bookedLeads} booked`,
    },
    {
      title: "Recent Activity",
      value: calls.length > 0 ? formatDistanceToNow(calls[0].createdAt instanceof Date ? calls[0].createdAt : new Date(calls[0].createdAt), { addSuffix: true }) : "No calls",
      icon: Clock,
      description: "Last call",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your leads and calls</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No calls yet. Calls will appear here once webhooks are received.
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => {
                const createdAt = call.createdAt instanceof Date ? call.createdAt : new Date(call.createdAt)
                return (
                  <Link
                    key={call.id}
                    href={`/calls/${call.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{call.callerName || "Unknown"}</span>
                          <span className="text-sm text-muted-foreground">{call.callerPhoneNumber}</span>
                          <Badge className={getSentimentColor(call.sentiment)}>
                            {call.sentiment || "N/A"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {call.summary || call.transcript.slice(0, 100) + "..."}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                          {call.durationSeconds && (
                            <span>Duration: {formatDuration(call.durationSeconds)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

