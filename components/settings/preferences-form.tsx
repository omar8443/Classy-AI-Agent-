"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"

export function PreferencesForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "fr",
    timezone: "America/Toronto",
    dateFormat: "MMM d, yyyy",
    currency: "CAD",
  })

  useEffect(() => {
    if (theme) {
      setPreferences((prev) => ({ ...prev, theme }))
    }
  }, [theme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) throw new Error("No user logged in")

      // Update theme
      setTheme(preferences.theme)

      // Update user preferences in Firestore
      const response = await fetch(`/api/users/${user.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            theme: preferences.theme,
            language: preferences.language,
            notifications: {
              email: true,
              push: false,
              newLead: true,
              newReservation: true,
            },
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to update preferences")

      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully.",
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
        <Label htmlFor="theme">Theme</Label>
        <Select
          value={preferences.theme}
          onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
        >
          <SelectTrigger id="theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select
          value={preferences.language}
          onValueChange={(value) => setPreferences({ ...preferences, language: value })}
        >
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select
          value={preferences.timezone}
          onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
        >
          <SelectTrigger id="timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
            <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
            <SelectItem value="America/Chicago">Central Time</SelectItem>
            <SelectItem value="America/Denver">Mountain Time</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
            <SelectItem value="Europe/Paris">Paris</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={preferences.currency}
          onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
        >
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CAD">CAD ($)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  )
}

