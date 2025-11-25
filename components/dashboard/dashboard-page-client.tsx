"use client"

import { Call } from "@/types/calls"
import { Lead } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { format } from "date-fns"
import Link from "next/link"
import { Phone, TrendingUp, Users, Clock } from "lucide-react"

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: Date
  endedAt: Date | null
}

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: Date
  updatedAt: Date
}

interface DashboardPageClientProps {
  leads: SerializedLead[]
  activeCalls: SerializedCall[]
  stats: Array<{
    title: string
    value: string
    description: string
    icon: any
  }>
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  
  if (digits.length === 10) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  return phone
}

export function DashboardPageClient({ leads, activeCalls, stats }: DashboardPageClientProps) {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of your leads and calls</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
          </CardHeader>
          <CardContent>
            {activeCalls.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No calls yet. Calls will appear here once webhooks are received.
              </div>
            ) : (
              <div className="space-y-4">
                {activeCalls.map((call) => {
                  const preview =
                    call.summary || (call.transcript ? `${call.transcript.slice(0, 100)}...` : "Awaiting transcript")
                  return (
                    <Link
                      key={call.id}
                      href={`/calls/${call.id}`}
                      className="block rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{call.callerName || "Unknown"}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatPhoneNumber(call.callerPhoneNumber || "No number")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{preview}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{format(call.createdAt, "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

