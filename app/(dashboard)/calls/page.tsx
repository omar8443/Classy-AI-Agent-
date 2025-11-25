import { getCalls } from "@/lib/firestore/calls"
import { CallsPageClient } from "@/components/calls/calls-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CallsPage() {
  const calls = await getCalls()

  // Serialize dates to ISO strings for client components
  const serializedCalls = calls.map((call) => ({
    ...call,
    createdAt: (call.createdAt instanceof Date ? call.createdAt : new Date()).toISOString(),
    endedAt: call.endedAt 
      ? (call.endedAt instanceof Date ? call.endedAt : new Date()).toISOString()
      : null,
  }))

  return <CallsPageClient calls={serializedCalls} />
}

