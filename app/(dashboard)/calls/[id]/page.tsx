import { notFound } from "next/navigation"
import { getCallById } from "@/lib/firestore/calls"
import { getLeadById } from "@/lib/firestore/leads"
import { CallDetailClient } from "@/components/calls/call-detail-client"

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

  // Serialize dates to ISO strings for client components
  const serializedCall = {
    ...call,
    createdAt: (call.createdAt instanceof Date ? call.createdAt : new Date()).toISOString(),
    endedAt: call.endedAt ? (call.endedAt instanceof Date ? call.endedAt : new Date()).toISOString() : null,
  }

  const serializedLead = lead ? {
    ...lead,
    createdAt: (lead.createdAt instanceof Date ? lead.createdAt : new Date()).toISOString(),
    updatedAt: (lead.updatedAt instanceof Date ? lead.updatedAt : new Date()).toISOString(),
  } : null

  const formattedTranscript = call.transcript
    ? call.transcript.replace(/ (\?|\!|:|;)/g, "\u00a0$1")
    : "No transcript available."

  return (
    <CallDetailClient 
      call={serializedCall} 
      lead={serializedLead} 
      formattedTranscript={formattedTranscript}
    />
  )
}

