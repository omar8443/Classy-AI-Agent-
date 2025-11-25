import { getCalls } from "@/lib/firestore/calls"
import { CallsPageClient } from "@/components/calls/calls-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CallsPage() {
  const calls = await getCalls()

  // Serialize Firestore Timestamps to plain Date objects
  const serializedCalls = calls.map((call) => ({
    ...call,
    createdAt: call.createdAt instanceof Date ? call.createdAt : call.createdAt?.toDate?.() || new Date(),
    endedAt: call.endedAt 
      ? (call.endedAt instanceof Date ? call.endedAt : call.endedAt?.toDate?.() || new Date()) 
      : null,
  }))

  return <CallsPageClient calls={serializedCalls} />
}

