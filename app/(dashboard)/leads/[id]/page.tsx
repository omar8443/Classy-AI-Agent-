import { notFound } from "next/navigation"
import { getLeadById } from "@/lib/firestore/leads"
import { getCallsByLeadId } from "@/lib/firestore/calls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LeadDetailForm } from "@/components/leads/LeadDetailForm"
import { CallsList } from "@/components/calls/CallsList"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { statusColors } from "@/lib/constants"

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [lead, calls] = await Promise.all([
    getLeadById(params.id),
    getCallsByLeadId(params.id),
  ])

  if (!lead) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/leads"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{lead.name || "Unknown Lead"}</h1>
          <p className="text-muted-foreground mt-2">Lead details and call history</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadDetailForm lead={lead} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge className={statusColors[lead.status] || statusColors.new}>
                {lead.status.replace("_", " ")}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">{lead.phoneNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Source</div>
              <div className="font-medium">{lead.source}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Calls</div>
              <div className="font-medium">{lead.totalCalls}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">
                {formatDistanceToNow(
                  lead.createdAt instanceof Date ? lead.createdAt : new Date(lead.createdAt),
                  { addSuffix: true }
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <CallsList calls={calls} />
        </CardContent>
      </Card>
    </div>
  )
}

