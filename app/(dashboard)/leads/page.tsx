import { getLeads } from "@/lib/firestore/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadsTable } from "@/components/leads/LeadsTable"

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground mt-2">Manage your leads and track their progress</p>
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
  )
}

