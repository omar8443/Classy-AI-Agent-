"use client"

import { Lead } from "@/types/leads"
import { LeadsTable } from "@/components/leads/LeadsTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/motion/page-wrapper"

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: Date
  updatedAt: Date
}

interface LeadsPageClientProps {
  leads: SerializedLead[]
}

export function LeadsPageClient({ leads }: LeadsPageClientProps) {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your leads and track their progress</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsTable leads={leads} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

