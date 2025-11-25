import { formatDistanceToNow } from "date-fns"
import { Phone, TrendingUp, Users, Clock } from "lucide-react"

import { getCalls } from "@/lib/firestore/calls"
import { getLeads } from "@/lib/firestore/leads"
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const [leads, calls] = await Promise.all([getLeads(), getCalls(10)])
  
  // Serialize dates
  const serializedLeads = leads.map((lead) => ({
    ...lead,
    createdAt: lead.createdAt instanceof Date ? lead.createdAt : lead.createdAt?.toDate?.() || new Date(),
    updatedAt: lead.updatedAt instanceof Date ? lead.updatedAt : lead.updatedAt?.toDate?.() || new Date(),
  }))

  const serializedCalls = calls.map((call) => ({
    ...call,
    createdAt: call.createdAt instanceof Date ? call.createdAt : call.createdAt?.toDate?.() || new Date(),
    endedAt: call.endedAt 
      ? (call.endedAt instanceof Date ? call.endedAt : call.endedAt?.toDate?.() || new Date()) 
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
          ? formatDistanceToNow(activeCalls[0].createdAt, { addSuffix: true })
          : "No calls",
      description: "Last call",
      icon: Clock,
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


