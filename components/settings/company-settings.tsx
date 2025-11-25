"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function CompanySettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    name: "Voyage Classy Travel",
    primaryColor: "#0EA5E9",
    contactEmail: "contact@voyageclassy.com",
    contactPhone: "+1 514-555-0100",
    address: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) throw new Error("No user logged in")

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: settings,
          updatedBy: user.uid,
        }),
      })

      if (!response.ok) throw new Error("Failed to update settings")

      toast({
        title: "Settings saved",
        description: "Company settings have been updated successfully.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input
          id="company-name"
          value={settings.name}
          onChange={(e) => setSettings({ ...settings, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary-color">Primary Color</Label>
        <div className="flex gap-2">
          <Input
            id="primary-color"
            type="color"
            value={settings.primaryColor}
            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            className="w-20 h-10"
          />
          <Input
            value={settings.primaryColor}
            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            placeholder="#0EA5E9"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Contact Email</Label>
        <Input
          id="contact-email"
          type="email"
          value={settings.contactEmail}
          onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone">Contact Phone</Label>
        <Input
          id="contact-phone"
          type="tel"
          value={settings.contactPhone}
          onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={settings.address}
          onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          placeholder="123 Main St, Montreal, QC H1A 1A1"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Company Settings"}
      </Button>
    </form>
  )
}

