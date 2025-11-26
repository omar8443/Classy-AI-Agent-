"use client"

import { useMemo } from "react"
import { Call } from "@/types/calls"
import { CallsTable } from "@/components/calls/CallsTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { useAuth } from "@/lib/hooks/useAuth"
import { CheckCircle2 } from "lucide-react"

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: string
  endedAt: string | null
}

interface AgentRequestedClientProps {
  assignedCalls: SerializedCall[]
}

export function AgentRequestedClient({ assignedCalls }: AgentRequestedClientProps) {
  const { user } = useAuth()

  // Filter to only show calls assigned to the current user
  const myAssignedCalls = useMemo(() => {
    if (!user) return []
    return assignedCalls.filter(call => call.assignedTo === user.uid)
  }, [assignedCalls, user])

  return (
    <PageWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Assigned to Me</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Calls assigned to you for follow-up
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned to Me</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myAssignedCalls.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Calls assigned to you</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assigned to Me</CardTitle>
          </CardHeader>
          <CardContent>
            <CallsTable calls={myAssignedCalls} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

