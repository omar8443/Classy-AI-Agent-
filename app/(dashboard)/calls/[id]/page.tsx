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

  // Serialize dates
  const serializedCall = {
    ...call,
    createdAt: call.createdAt instanceof Date ? call.createdAt : call.createdAt?.toDate?.() || new Date(),
    endedAt: call.endedAt ? (call.endedAt instanceof Date ? call.endedAt : call.endedAt?.toDate?.() || new Date()) : null,
  }

  const serializedLead = lead ? {
    ...lead,
    createdAt: lead.createdAt instanceof Date ? lead.createdAt : lead.createdAt?.toDate?.() || new Date(),
    updatedAt: lead.updatedAt instanceof Date ? lead.updatedAt : lead.updatedAt?.toDate?.() || new Date(),
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

