"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Call } from "@/types/calls"
import { Lead } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CallActions } from "@/components/calls/call-actions"
import { TranscriptViewer } from "@/components/calls/transcript-viewer"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/useAuth"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, User, UserPlus, AlertCircle } from "lucide-react"

// Serialized types for client components
export type SerializedCall = Omit<Call, "createdAt" | "endedAt"> & {
  createdAt: string
  endedAt: string | null
}

export type SerializedLead = Omit<Lead, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
} | null

interface CallDetailClientProps {
  call: SerializedCall
  lead: SerializedLead
  formattedTranscript: string
}

export function CallDetailClient({ 
  call: initialCall, 
  lead, 
  formattedTranscript
}: CallDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [call, setCall] = useState(initialCall)
  const [isAssigning, setIsAssigning] = useState(false)

  // Navigate back and refresh to update the calls list
  const handleBack = () => {
    router.push("/calls")
    router.refresh()
  }

  // Handle manual assignment
  const handleAssignToMe = async () => {
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
        toast({
          title: "Call assigned",
          description: "This call has been assigned to you.",
        })
      }
    } catch (error) {
      console.error("Failed to assign call:", error)
      toast({
        title: "Assignment failed",
        description: "Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Assignment reminder banner */}
      {!call.assignedTo && user && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-200">
                This call is not assigned
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Take ownership of this call to track your progress
              </p>
            </div>
          </div>
          <Button 
            onClick={handleAssignToMe}
            disabled={isAssigning}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isAssigning ? "Assigning..." : "Assign to me"}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Call Details</h1>
            <p className="text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <CallActions call={call} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              {lead?.name || call.callerName || "Caller"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{call.callerPhoneNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              {lead?.email ? (
                <a href={`mailto:${lead.email}`} className="font-medium text-primary hover:underline">
                  {lead.email}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            {call.assignedToName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Assigned</span>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {call.assignedToName}
                </Badge>
              </div>
            )}
            {call.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {call.labels.map((label) => (
                  <Badge key={label} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
            {call.audioUrl && (
              <div className="pt-2">
                <audio controls className="w-full h-8">
                  <source src={call.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {call.summary || "No summary available."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversation Transcript */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TranscriptViewer transcript={call.transcript} />
          </CardContent>
        </Card>

        {/* Agent Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Agent Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Price Quoted
              </label>
              <input
                type="text"
                defaultValue={lead?.quotedPrice?.toString() || ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="$0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <textarea
                className="min-h-[200px] w-full resize-none rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add notes..."
                defaultValue={call.notes || ""}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

