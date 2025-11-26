"use client"

import { Lead } from "@/types/leads"
import { LeadsTable } from "@/components/leads/LeadsTable"
import { PageWrapper } from "@/components/motion/page-wrapper"

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}

interface LeadsPageClientProps {
  leads: SerializedLead[]
}

export function LeadsPageClient({ leads }: LeadsPageClientProps) {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Leads</h1>
          <p className="mt-2 text-sm text-neutral-600">Manage your leads and track their progress</p>
        </div>

        <LeadsTable leads={leads} />
      </div>
    </PageWrapper>
  )
}

