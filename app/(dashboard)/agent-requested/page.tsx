import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAssignedCalls } from "@/lib/firestore/calls"
import { AgentRequestedClient } from "@/components/agent-requested/agent-requested-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AgentRequestedPage() {
  // This will be filtered on the client side to show only current user's assigned calls
  const assignedCalls = await getAssignedCalls(undefined, true)

  // Deep serialize to plain JSON objects
  const serializedCalls = JSON.parse(JSON.stringify(assignedCalls))

  return <AgentRequestedClient assignedCalls={serializedCalls} />
}

