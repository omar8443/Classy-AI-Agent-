import { LeadsTable } from "@/components/leads/LeadsTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLeads } from "@/lib/firestore/leads"
import { PageWrapper } from "@/components/motion/page-wrapper"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LeadsPage() {
  const leads = await getLeads()

  // Serialize Firestore Timestamps to plain Date objects
  const serializedLeads = leads.map((lead) => ({
    ...lead,
    createdAt: lead.createdAt instanceof Date ? lead.createdAt : lead.createdAt?.toDate?.() || new Date(),
    updatedAt: lead.updatedAt instanceof Date ? lead.updatedAt : lead.updatedAt?.toDate?.() || new Date(),
  }))

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
            <LeadsTable leads={serializedLeads} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

