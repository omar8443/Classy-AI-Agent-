import { CallsTable } from "@/components/calls/CallsTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCalls } from "@/lib/firestore/calls"

export default async function CallsPage() {
  const calls = await getCalls()

  return (
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
          <CallsTable calls={calls} />
        </CardContent>
      </Card>
    </div>
  )
}

