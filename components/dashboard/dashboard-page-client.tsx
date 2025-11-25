"use client"

import { Call } from "@/types/calls"
import { Lead } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { format, formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Phone, TrendingUp, Users, Clock, Plane, MapPin, Calendar, User } from "lucide-react"

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: string
  endedAt: string | null
}

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}

interface DashboardPageClientProps {
  leads: SerializedLead[]
  activeCalls: SerializedCall[]
  stats: Array<{
    title: string
    value: string
    description: string
    icon: string
  }>
}

const iconMap = {
  users: Users,
  phone: Phone,
  "trending-up": TrendingUp,
  clock: Clock,
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

// Boarding pass style card for recent calls
function BoardingPassCard({ call, lead }: { call: SerializedCall; lead?: SerializedLead }) {
  const createdAt = new Date(call.createdAt)
  
  // Extract destination from summary or transcript (simple heuristic)
  const extractDestination = () => {
    const text = call.summary || call.transcript || ""
    // Common destination patterns
    const destinations = ["Paris", "Cancun", "Mexico", "Cuba", "Dominican", "Punta Cana", "Jamaica", "Bahamas", "Florida", "Miami", "New York", "Las Vegas", "Los Angeles", "Hawaii", "Europe", "Caribbean"]
    for (const dest of destinations) {
      if (text.toLowerCase().includes(dest.toLowerCase())) {
        return dest
      }
    }
    return null
  }
  
  const destination = extractDestination()
  
  return (
    <Link href={`/calls/${call.id}`} className="block group">
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/20 bg-gradient-to-r from-card to-muted/30 transition-all hover:border-primary/40 hover:shadow-lg">
        {/* Ticket perforation effect */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary to-primary/20" />
        
        <div className="flex">
          {/* Left section - Main info */}
          <div className="flex-1 p-4 pl-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-lg">
                    {call.callerName || lead?.name || "Unknown Passenger"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {formatPhoneNumber(call.callerPhoneNumber)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Received</div>
                <div className="text-sm font-medium">
                  {formatDistanceToNow(createdAt, { addSuffix: true })}
                </div>
              </div>
            </div>
            
            {/* Route visualization */}
            <div className="mt-4 flex items-center gap-3">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase">From</div>
                <div className="font-bold text-lg">MTL</div>
                <div className="text-xs text-muted-foreground">Montreal</div>
              </div>
              
              <div className="flex-1 flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/40 to-transparent" />
                <Plane className="h-5 w-5 text-primary rotate-90 group-hover:translate-x-1 transition-transform" />
                <div className="h-px flex-1 bg-gradient-to-l from-muted-foreground/40 to-transparent" />
              </div>
              
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase">To</div>
                <div className="font-bold text-lg">{destination ? destination.slice(0, 3).toUpperCase() : "TBD"}</div>
                <div className="text-xs text-muted-foreground">{destination || "To be determined"}</div>
              </div>
            </div>
          </div>
          
          {/* Right section - Ticket stub */}
          <div className="w-28 border-l-2 border-dashed border-muted-foreground/20 p-3 flex flex-col items-center justify-center bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Call ID</div>
            <div className="font-mono text-xs font-bold">{call.id.slice(0, 8)}</div>
            <div className="mt-3">
              <Calendar className="h-4 w-4 text-muted-foreground mb-1 mx-auto" />
              <div className="text-xs font-medium">{format(createdAt, "MMM d")}</div>
              <div className="text-xs text-muted-foreground">{format(createdAt, "h:mm a")}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function DashboardPageClient({ leads, activeCalls, stats }: DashboardPageClientProps) {
  // Create a map of leads by phone number for quick lookup
  const leadsByPhone = new Map(leads.map(lead => [lead.phoneNumber, lead]))
  
  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back to Voyage Classy Travel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon as keyof typeof iconMap]
            const colors = [
              "from-blue-500/10 to-blue-500/5 border-blue-500/20",
              "from-green-500/10 to-green-500/5 border-green-500/20",
              "from-purple-500/10 to-purple-500/5 border-purple-500/20",
              "from-orange-500/10 to-orange-500/5 border-orange-500/20",
            ]
            const iconColors = ["text-blue-500", "text-green-500", "text-purple-500", "text-orange-500"]
            
            return (
              <Card key={stat.title} className={`bg-gradient-to-br ${colors[index]} border overflow-hidden`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`h-8 w-8 rounded-lg bg-background/50 flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${iconColors[index]}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Calls - Boarding Pass Style */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Recent Calls</h2>
              <p className="text-sm text-muted-foreground">Latest inquiries from potential travelers</p>
            </div>
            <Link 
              href="/calls" 
              className="text-sm text-primary hover:underline font-medium"
            >
              View all calls →
            </Link>
          </div>
          
          {activeCalls.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Plane className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No calls yet. Calls will appear here once webhooks are received.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeCalls.slice(0, 6).map((call) => {
                const lead = leadsByPhone.get(call.callerPhoneNumber)
                return <BoardingPassCard key={call.id} call={call} lead={lead} />
              })}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
