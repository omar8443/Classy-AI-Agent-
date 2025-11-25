import { getLeads } from "@/lib/firestore/leads"
import { LeadsPageClient } from "@/components/leads/leads-page-client"

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

  return <LeadsPageClient leads={serializedLeads} />
}

