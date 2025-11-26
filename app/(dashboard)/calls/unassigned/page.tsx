import { getUnassignedCalls } from "@/lib/firestore/calls"
import { CallsPageClient } from "@/components/calls/calls-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UnassignedCallsPage() {
  const calls = await getUnassignedCalls()

  // Deep serialize to plain JSON objects
  const serializedCalls = JSON.parse(JSON.stringify(calls))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Requested Agent</h1>
        <p className="text-muted-foreground mt-2">
          Calls waiting to be assigned to an agent
        </p>
      </div>
      <CallsPageClient calls={serializedCalls} />
    </div>
  )
}

