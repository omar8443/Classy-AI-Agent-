import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { ReservationForm } from "@/components/reservations/reservation-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function NewReservationPage() {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/reservations"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">New Reservation</h1>
            <p className="text-muted-foreground mt-2">Create a new travel booking</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationForm />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

