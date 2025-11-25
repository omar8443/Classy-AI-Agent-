import { getLeads } from "@/lib/firestore/leads"
import { LeadsPageClient } from "@/components/leads/leads-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LeadsPage() {
  const leads = await getLeads()

  // Serialize dates to ISO strings for client components
  const serializedLeads = leads.map((lead) => ({
    ...lead,
    createdAt: (lead.createdAt instanceof Date ? lead.createdAt : new Date()).toISOString(),
    updatedAt: (lead.updatedAt instanceof Date ? lead.updatedAt : new Date()).toISOString(),
  }))

  return <LeadsPageClient leads={serializedLeads} />
}

