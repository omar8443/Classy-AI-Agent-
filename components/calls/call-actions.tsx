"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Call } from "@/types/calls"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { BanNumberModal } from "@/components/calls/ban-number-modal"
import { AssignAgentModal } from "@/components/calls/assign-agent-modal"
import { Ban, Calendar, AlertTriangle, UserPlus } from "lucide-react"

interface CallActionsProps {
  call: Call
}

export function CallActions({ call }: CallActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleMarkAsSpam = async () => {
    if (!confirm("Mark this call as spam? This will archive it and add a spam label.")) {
      return
    }

    setLoading("spam")
    try {
      const response = await fetch(`/api/calls/${call.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archived: true,
          labels: [...(call.labels || []), "spam"],
        }),
      })

      if (!response.ok) throw new Error("Failed to mark as spam")

      toast({
        title: "Marked as spam",
        description: "Call has been archived and labeled as spam.",
      })

      router.push("/calls")
    } catch (error) {
      console.error(error)
      toast({
        title: "Action failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleProceedToReservation = () => {
    // Redirect to new reservation page with pre-filled lead ID
    router.push(`/reservations/new?leadId=${call.leadId}&callId=${call.id}`)
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleProceedToReservation}
          disabled={!call.leadId}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Proceed to Reservation
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setAssignModalOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Agent
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setBanModalOpen(true)}
        >
          <Ban className="mr-2 h-4 w-4" />
          Ban Number
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleMarkAsSpam}
          disabled={loading === "spam"}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          {loading === "spam" ? "Marking..." : "Mark as Spam"}
        </Button>
      </div>

      <BanNumberModal
        open={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        phoneNumber={call.callerPhoneNumber}
        callId={call.id}
      />

      <AssignAgentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        callId={call.id}
        currentAssignedTo={call.assignedTo}
      />
    </>
  )
}

