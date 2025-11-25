"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Call } from "@/types/calls"
import { Lead } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/useAuth"
import { format, formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Phone, TrendingUp, Users, Clock, Plane, User, UserPlus, Check } from "lucide-react"

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
function BoardingPassCard({ 
  call: initialCall, 
  lead,
  onAssign 
}: { 
  call: SerializedCall
  lead?: SerializedLead
  onAssign: (callId: string, assignedTo: string, assignedToName: string) => void
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [call, setCall] = useState(initialCall)
  const [isAssigning, setIsAssigning] = useState(false)
  
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
  
  const handleAssign = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) return
    
    setIsAssigning(true)
    const userName = user.displayName || user.email?.split("@")[0] || "Agent"
    
    try {
      const response = await fetch(`/api/calls/${call.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          assignedTo: user.uid,
          assignedToName: userName 
        }),
      })
      
      if (response.ok) {
        setCall(prev => ({
          ...prev,
          assignedTo: user.uid,
          assignedToName: userName
        }))
        onAssign(call.id, user.uid, userName)
        toast({ title: "Assigned!", description: "Call assigned to you." })
      }
    } catch (error) {
      console.error("Failed to assign:", error)
      toast({ title: "Error", description: "Failed to assign call.", variant: "destructive" })
    } finally {
      setIsAssigning(false)
    }
  }
  
  const isAssigned = !!call.assignedTo
  
  return (
    <Link href={`/calls/${call.id}`} className="block group">
      <div className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all hover:shadow-lg ${
        isAssigned 
          ? "border-green-500/30 bg-gradient-to-r from-card to-green-500/5 hover:border-green-500/50" 
          : "border-orange-500/30 bg-gradient-to-r from-card to-orange-500/5 hover:border-orange-500/50"
      }`}>
        {/* Ticket perforation effect */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
          isAssigned ? "from-green-500/20 via-green-500 to-green-500/20" : "from-orange-500/20 via-orange-500 to-orange-500/20"
        }`} />
        
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
          
          {/* Right section - Assignment */}
          <div className="w-28 border-l-2 border-dashed border-muted-foreground/20 p-3 flex flex-col items-center justify-center bg-muted/20">
            {isAssigned ? (
              <>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Assigned</div>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  {call.assignedToName?.split(" ")[0] || "Agent"}
                </Badge>
              </>
            ) : (
              <>
                <div className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2 font-medium">
                  Unassigned
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-orange-500/50 text-orange-600 hover:bg-orange-500 hover:text-white dark:text-orange-400"
                  onClick={handleAssign}
                  disabled={isAssigning}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  {isAssigning ? "..." : "Take"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export function DashboardPageClient({ leads, activeCalls: initialCalls, stats }: DashboardPageClientProps) {
  const [activeCalls, setActiveCalls] = useState(initialCalls)
  
  // Create a map of leads by phone number for quick lookup
  const leadsByPhone = new Map(leads.map(lead => [lead.phoneNumber, lead]))
  
  // Handle assignment update
  const handleAssign = (callId: string, assignedTo: string, assignedToName: string) => {
    setActiveCalls(prev => 
      prev.map(call => 
        call.id === callId 
          ? { ...call, assignedTo, assignedToName } 
          : call
      )
    )
  }
  
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
                return (
                  <BoardingPassCard 
                    key={call.id} 
                    call={call} 
                    lead={lead} 
                    onAssign={handleAssign}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
