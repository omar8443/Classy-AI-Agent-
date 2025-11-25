import { formatDistanceToNow } from "date-fns"

import { getCalls } from "@/lib/firestore/calls"
import { getLeads } from "@/lib/firestore/leads"
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const [leads, calls] = await Promise.all([getLeads(), getCalls(10)])
  
  // Deep serialize to plain JSON objects
  const serializedLeads = JSON.parse(JSON.stringify(leads))
  const serializedCalls = JSON.parse(JSON.stringify(calls))

  const activeCalls = serializedCalls.filter((call: any) => !call.archived)

  const totalLeads = serializedLeads.length
  const newLeadsThisWeek = serializedLeads.filter((lead: any) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(lead.createdAt) >= weekAgo
  }).length
  const totalCalls = activeCalls.length
  const bookedLeads = serializedLeads.filter((lead: any) => lead.status === "booked").length
  const conversionRate = totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : "0"

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads.toString(),
      description: `${newLeadsThisWeek} new this week`,
      icon: "users",
    },
    {
      title: "Total Calls",
      value: totalCalls.toString(),
      description: "All time",
      icon: "phone",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      description: `${bookedLeads} booked`,
      icon: "trending-up",
    },
    {
      title: "Recent Activity",
      value:
        activeCalls.length > 0
          ? formatDistanceToNow(new Date(activeCalls[0].createdAt), { addSuffix: true })
          : "No calls",
      description: "Last call",
      icon: "clock",
    },
  ]

  return (
    <DashboardPageClient 
      leads={serializedLeads}
      activeCalls={activeCalls}
      stats={stats}
    />
  )
}


