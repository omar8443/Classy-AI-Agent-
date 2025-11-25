import { formatDistanceToNow } from "date-fns"

import { getCalls } from "@/lib/firestore/calls"
import { getLeads } from "@/lib/firestore/leads"
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const [leads, calls] = await Promise.all([getLeads(), getCalls(10)])
  
  // Serialize dates to ISO strings for client components
  const serializedLeads = leads.map((lead) => ({
    ...lead,
    createdAt: (lead.createdAt instanceof Date ? lead.createdAt : new Date()).toISOString(),
    updatedAt: (lead.updatedAt instanceof Date ? lead.updatedAt : new Date()).toISOString(),
  }))

  const serializedCalls = calls.map((call) => ({
    ...call,
    createdAt: (call.createdAt instanceof Date ? call.createdAt : new Date()).toISOString(),
    endedAt: call.endedAt 
      ? (call.endedAt instanceof Date ? call.endedAt : new Date()).toISOString()
      : null,
  }))

  const activeCalls = serializedCalls.filter((call) => !call.archived)

  const totalLeads = serializedLeads.length
  const newLeadsThisWeek = serializedLeads.filter((lead) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return lead.createdAt >= weekAgo
  }).length
  const totalCalls = activeCalls.length
  const bookedLeads = serializedLeads.filter((lead) => lead.status === "booked").length
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
          ? formatDistanceToNow(activeCalls[0].createdAt, { addSuffix: true })
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


