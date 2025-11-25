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

  // Deep serialize to plain JSON objects
  const serializedLead = JSON.parse(JSON.stringify(lead))
  const serializedCalls = JSON.parse(JSON.stringify(calls))

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

