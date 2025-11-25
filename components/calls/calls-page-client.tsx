"use client"

import { Call } from "@/types/calls"
import { CallsTable } from "@/components/calls/CallsTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/motion/page-wrapper"

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: string
  endedAt: string | null
}

interface CallsPageClientProps {
  calls: SerializedCall[]
}

export function CallsPageClient({ calls }: CallsPageClientProps) {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Calls</h1>
          <p className="mt-2 text-sm text-muted-foreground">View and manage all call records</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <CallsTable calls={calls} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

