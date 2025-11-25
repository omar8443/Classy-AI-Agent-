import { notFound } from "next/navigation"
import { getLeadById } from "@/lib/firestore/leads"
import { getCallsByLeadId } from "@/lib/firestore/calls"
import { LeadDetailClient } from "@/components/leads/lead-detail-client"

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [lead, calls] = await Promise.all([
    getLeadById(params.id),
    getCallsByLeadId(params.id),
  ])

  if (!lead) {
    notFound()
  }

  // Serialize dates
  const serializedLead = {
    ...lead,
    createdAt: lead.createdAt instanceof Date ? lead.createdAt : lead.createdAt?.toDate?.() || new Date(),
    updatedAt: lead.updatedAt instanceof Date ? lead.updatedAt : lead.updatedAt?.toDate?.() || new Date(),
  }

  const serializedCalls = calls.map((call) => ({
    ...call,
    createdAt: call.createdAt instanceof Date ? call.createdAt : call.createdAt?.toDate?.() || new Date(),
    endedAt: call.endedAt 
      ? (call.endedAt instanceof Date ? call.endedAt : call.endedAt?.toDate?.() || new Date()) 
      : null,
  }))

  const latestCall = serializedCalls[0] || null
  const latestSummary =
    latestCall?.summary || (latestCall?.transcript ? `${latestCall.transcript.slice(0, 280)}...` : null)
  const latestCallTimestamp = latestCall?.createdAt || null

  return (
    <LeadDetailClient
      lead={serializedLead}
      calls={serializedCalls}
      latestSummary={latestSummary}
      latestCallTimestamp={latestCallTimestamp}
    />
  )
}

