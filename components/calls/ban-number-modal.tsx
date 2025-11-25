"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface BanNumberModalProps {
  open: boolean
  onClose: () => void
  phoneNumber: string
  callId: string
}

export function BanNumberModal({ open, onClose, phoneNumber, callId }: BanNumberModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")

  const handleBan = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for banning this number.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/calls/ban-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          reason,
          callId,
        }),
      })

      if (!response.ok) throw new Error("Failed to ban number")

      toast({
        title: "Number banned",
        description: `${phoneNumber} has been added to the banned list.`,
      })

      onClose()
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Ban failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban Phone Number</DialogTitle>
          <DialogDescription>
            This will prevent future calls from this number from being processed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={phoneNumber} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Spam, Harassment, Wrong number..."
              rows={3}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleBan} disabled={loading}>
            {loading ? "Banning..." : "Ban Number"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

