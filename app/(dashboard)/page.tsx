import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Phone, TrendingUp, Users, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCalls } from "@/lib/firestore/calls"
import { getLeads } from "@/lib/firestore/leads"
import { PageWrapper } from "@/components/motion/page-wrapper"

export const dynamic = "force-dynamic"
export const revalidate = 0

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, "")
  
  // If it's 10 digits, assume US/Canada format
  if (digits.length === 10) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  // If it's 11 digits starting with 1, format as US/Canada
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  // For any other length, try to format with +1 prefix if possible
  if (digits.length >= 10) {
    const last10 = digits.slice(-10)
    return `+1 ${last10.slice(0, 3)}-${last10.slice(3, 6)}-${last10.slice(6)}`
  }
  
  // Otherwise return as-is
  return phone
}

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
      title: "Booked Leads",
      value: bookedLeads.toString(),
      description: "Total bookings",
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
    <PageWrapper>
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{call.callerName || "Unknown"}</span>
                          <span className="text-sm text-muted-foreground">{formatPhoneNumber(call.callerPhoneNumber || "No number")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{preview}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                        <span>{createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : "Just now"}</span>
                        {call.assignedToName ? (
                          <span className="text-green-600 dark:text-green-400">Assigned to {call.assignedToName}</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">Unassigned</span>
                        )}
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
    </PageWrapper>
  )
}


