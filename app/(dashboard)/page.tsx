import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Phone, TrendingUp, Users, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCalls } from "@/lib/firestore/calls"
import { getLeads } from "@/lib/firestore/leads"

export default async function DashboardPage() {
  const [leads, calls] = await Promise.all([getLeads(), getCalls(10)])
  const activeCalls = calls.filter((call) => !call.archived)

  const totalLeads = leads.length
  const newLeadsThisWeek = leads.filter((lead) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const createdAt = lead.createdAt instanceof Date ? lead.createdAt : lead.createdAt?.toDate?.()
    return (createdAt || new Date()) >= weekAgo
  }).length
  const totalCalls = activeCalls.length
  const bookedLeads = leads.filter((lead) => lead.status === "booked").length
  const conversionRate = totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : "0"

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads.toString(),
      description: `${newLeadsThisWeek} new this week`,
      icon: Users,
    },
    {
      title: "Total Calls",
      value: totalCalls.toString(),
      description: "All time",
      icon: Phone,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      description: `${bookedLeads} booked`,
      icon: TrendingUp,
    },
    {
      title: "Recent Activity",
      value:
        activeCalls.length > 0
          ? formatDistanceToNow(
              activeCalls[0].createdAt instanceof Date
                ? activeCalls[0].createdAt
                : activeCalls[0].createdAt?.toDate?.() || new Date(),
              { addSuffix: true }
            )
          : "No calls",
      description: "Last call",
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of your leads and calls</p>
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
                <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
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
          {activeCalls.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No calls yet. Calls will appear here once webhooks are received.
            </div>
          ) : (
            <div className="space-y-4">
              {activeCalls.map((call) => {
                const createdAt = call.createdAt instanceof Date ? call.createdAt : call.createdAt?.toDate?.()
                const preview =
                  call.summary || (call.transcript ? `${call.transcript.slice(0, 100)}...` : "Awaiting transcript")
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
                          <span className="text-sm text-muted-foreground">{call.callerPhoneNumber || "No number"}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{preview}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : "Just now"}</span>
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


