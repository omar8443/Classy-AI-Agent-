import { getCalls } from "@/lib/firestore/calls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CallsTable } from "@/components/calls/CallsTable"

export default async function CallsPage() {
  const calls = await getCalls()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Calls</h1>
        <p className="text-muted-foreground mt-2">View and manage all call records</p>
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

