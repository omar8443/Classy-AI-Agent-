"use client"

import { Lead } from "@/types/leads"
import { Call } from "@/types/calls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { CallsList } from "@/components/calls/CallsList"
import { format, formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ArrowLeft, Phone, Mail, Calendar, Plane, MapPin, Clock, MessageSquare } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}

type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: string
  endedAt: string | null
  summary: string
}

interface LeadDetailClientProps {
  lead: SerializedLead
  calls: SerializedCall[]
  latestSummary: string | null
  latestCallTimestamp: string | null
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function LeadDetailClient({
  lead,
  calls,
  latestSummary,
  latestCallTimestamp,
}: LeadDetailClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [name, setName] = useState(lead.name || "")
  const [email, setEmail] = useState(lead.email || "")
  const [notes, setNotes] = useState(lead.notes || "")
  const [preferredDestinations, setPreferredDestinations] = useState(lead.travelPreferences?.preferredDestinations || "")
  const [budgetRange, setBudgetRange] = useState(lead.travelPreferences?.budgetRange || "")
  const [travelStyle, setTravelStyle] = useState(lead.travelPreferences?.travelStyle || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          notes,
          travelPreferences: {
            preferredDestinations: preferredDestinations || null,
            budgetRange: budgetRange || null,
            travelStyle: travelStyle || null,
          }
        }),
      })
      if (!response.ok) throw new Error("Failed to save")
      toast({ title: "Saved", description: "Client profile updated." })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const createdAt = new Date(lead.createdAt)

  // Generate overall summary from all calls
  const overallSummary = calls.length > 0 
    ? calls
        .filter(call => call.summary)
        .map(call => call.summary)
        .join(" ")
    : "No call history yet."

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/leads"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{lead.name || "Unknown Client"}</h1>
            <p className="text-muted-foreground">
              Client since {format(createdAt, "MMMM yyyy")}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Client Interest Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {overallSummary}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Client name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </label>
                <a
                  href={`tel:${lead.phoneNumber}`}
                  className="block mt-1 text-lg font-medium text-primary hover:underline"
                >
                  {formatPhoneNumber(lead.phoneNumber)}
                </a>
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="mt-1"
                />
              </div>
              <div className="pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">{lead.totalCalls}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total Calls</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-xs text-muted-foreground mt-1">Bookings</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Travel Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Destinations</label>
                <Input
                  value={preferredDestinations}
                  onChange={(e) => setPreferredDestinations(e.target.value)}
                  placeholder="Paris, Maldives, Japan..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Budget</label>
                <Input
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  placeholder="$2,000 - $5,000"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Style</label>
                <Input
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  placeholder="Luxury, Adventure, Family..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agent Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this client..."
                className="min-h-[280px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`tel:${lead.phoneNumber}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Client
                </a>
              </Button>
              {lead.email && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${lead.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Create Reservation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Call History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CallsList calls={calls} />
        </CardContent>
      </Card>
    </div>
  )
}

