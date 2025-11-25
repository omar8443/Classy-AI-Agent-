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

  // Deep serialize to plain JSON objects
  const serializedCall = JSON.parse(JSON.stringify(call))
  const serializedLead = lead ? JSON.parse(JSON.stringify(lead)) : null

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

