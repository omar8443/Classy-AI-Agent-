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

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length >= 10) {
    const last10 = digits.slice(-10)
    return `+1 ${last10.slice(0, 3)}-${last10.slice(3, 6)}-${last10.slice(6)}`
  }
  return phone
}

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
        description: `${formatPhoneNumber(phoneNumber)} has been added to the banned list.`,
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
            <Input value={formatPhoneNumber(phoneNumber)} disabled />
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

