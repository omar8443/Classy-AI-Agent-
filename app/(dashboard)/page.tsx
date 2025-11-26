import { formatDistanceToNow } from "date-fns"
import { Phone, TrendingUp, Users, Clock } from "lucide-react"

import { getCalls } from "@/lib/firestore/calls"
import { getLeads } from "@/lib/firestore/leads"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { RecentCallsList } from "@/components/dashboard/RecentCallsList"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const [leads, calls] = await Promise.all([getLeads(), getCalls(10)])
  const activeCalls = calls.filter((call) => !call.archived)
  
  // Serialize calls for client component - convert all fields to plain objects
  const serializedCalls = activeCalls.map((call) => {
    const createdAt = call.createdAt instanceof Date 
      ? call.createdAt.toISOString() 
      : call.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    
    const endedAt = call.endedAt 
      ? (call.endedAt instanceof Date 
          ? call.endedAt.toISOString() 
          : call.endedAt?.toDate?.()?.toISOString())
      : null

    return {
      id: call.id,
      callerName: call.callerName || null,
      callerPhoneNumber: call.callerPhoneNumber || "",
      transcript: call.transcript || "",
      summary: call.summary || null,
      assignedTo: call.assignedTo || null,
      assignedToName: call.assignedToName || null,
      archived: call.archived || false,
      createdAt,
      endedAt,
    }
  })

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
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="mt-2 text-neutral-600">Overview of your leads and calls</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="bg-white rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-neutral-500" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Calls Card */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Calls</h2>
          </div>
          <RecentCallsList initialCalls={serializedCalls} />
        </div>
      </div>
    </PageWrapper>
  )
}


