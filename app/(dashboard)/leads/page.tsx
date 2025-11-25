import { getLeads } from "@/lib/firestore/leads"
import { LeadsPageClient } from "@/components/leads/leads-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LeadsPage() {
  const leads = await getLeads()

  // Deep serialize to plain JSON objects
  const serializedLeads = JSON.parse(JSON.stringify(leads))

  return <LeadsPageClient leads={serializedLeads} />
}

