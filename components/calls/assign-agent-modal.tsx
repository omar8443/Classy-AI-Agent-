"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/useAuth"
import { usePermissions } from "@/lib/hooks/usePermissions"

interface Agent {
  id: string
  name: string
  email: string
}

interface AssignAgentModalProps {
  open: boolean
  onClose: () => void
  callId: string
  currentAssignedTo: string | null
}

export function AssignAgentModal({
  open,
  onClose,
  callId,
  currentAssignedTo,
}: AssignAgentModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { isAdmin } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>(currentAssignedTo || "")

  useEffect(() => {
    async function fetchAgents() {
      try {
        // If not admin, only show the current user as option
        if (!isAdmin && user) {
          const userName = user.displayName || user.email?.split("@")[0] || "Me"
          setAgents([{
            id: user.uid,
            name: userName,
            email: user.email || ""
          }])
          setSelectedAgent(user.uid)
        } else if (isAdmin) {
          // Admins can see all agents
          const response = await fetch("/api/users?role=agent")
          if (response.ok) {
            const data = await response.json()
            setAgents(data)
          }
        }
      } catch (error) {
        console.error("Error fetching agents:", error)
      }
    }

    if (open) {
      fetchAgents()
    }
  }, [open, isAdmin, user])

  const handleAssign = async () => {
    if (!selectedAgent || !user) {
      toast({
        title: "Agent required",
        description: "Please select an agent.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const agent = agents.find((a) => a.id === selectedAgent)
      
      // Get current user role
      const tokenResult = await user.getIdTokenResult()
      const currentUserRole = tokenResult.claims.role as string | undefined

      const response = await fetch(`/api/calls/${callId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedAgent,
          assignedTo: selectedAgent,
          assignedToName: agent?.name || "Unknown",
          currentUserId: user.uid,
          currentUserRole: currentUserRole || "agent",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to assign agent")
      }

      toast({
        title: "Call assigned",
        description: `Call has been assigned to ${agent?.name}.`,
      })

      onClose()
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Assignment failed",
        description: error instanceof Error ? error.message : "Please try again.",
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
          <DialogTitle>Assign {isAdmin ? "Agent" : "to Me"}</DialogTitle>
          <DialogDescription>
            {isAdmin 
              ? "Assign this call to a specific agent for follow-up."
              : "Take ownership of this call for follow-up."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="agent">Select Agent *</Label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger id="agent">
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} ({agent.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

