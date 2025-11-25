import { CallsTable } from "@/components/calls/CallsTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCalls } from "@/lib/firestore/calls"
import { PageWrapper } from "@/components/motion/page-wrapper"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CallsPage() {
  const calls = await getCalls()

  // Serialize Firestore Timestamps to plain Date objects
  const serializedCalls = calls.map((call) => ({
    ...call,
    createdAt: call.createdAt instanceof Date ? call.createdAt : call.createdAt?.toDate?.() || new Date(),
    endedAt: call.endedAt 
      ? (call.endedAt instanceof Date ? call.endedAt : call.endedAt?.toDate?.() || new Date()) 
      : null,
  }))

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
            <CallsTable calls={serializedCalls} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

