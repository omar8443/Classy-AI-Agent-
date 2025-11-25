import { getCalls } from "@/lib/firestore/calls"
import { CallsPageClient } from "@/components/calls/calls-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CallsPage() {
  const calls = await getCalls()

  // Deep serialize to plain JSON objects
  const serializedCalls = JSON.parse(JSON.stringify(calls))

  return <CallsPageClient calls={serializedCalls} />
}

