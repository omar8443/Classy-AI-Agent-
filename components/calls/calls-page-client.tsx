"use client"

import { Call } from "@/types/calls"
import { CallsTable } from "@/components/calls/CallsTable"
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Calls</h1>
          <p className="mt-2 text-sm text-neutral-600">View and manage all call records</p>
        </div>

        <CallsTable calls={calls} />
      </div>
    </PageWrapper>
  )
}

