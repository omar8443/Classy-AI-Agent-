"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface ServiceStatus {
  name: string
  status: "operational" | "degraded" | "down"
  latency?: number
  lastCheck: Date
  message?: string
}

export function IntegrationsStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(false)

  const checkServices = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/health")
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error("Error checking services:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkServices()
    // Auto-refresh every 5 minutes
    const interval = setInterval(checkServices, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "down":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      operational: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      degraded: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      down: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    }
    return colors[status as keyof typeof colors] || ""
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Monitor the status of integrated services
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={checkServices}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>Loading service status...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="font-medium">{service.name}</p>
                  {service.message && (
                    <p className="text-xs text-muted-foreground">{service.message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {service.latency && (
                  <span className="text-sm text-muted-foreground">{service.latency}ms</span>
                )}
                <Badge className={getStatusBadge(service.status)}>{service.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">API Keys & Webhooks</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ElevenLabs Webhook</span>
            <code className="rounded bg-muted px-2 py-1 text-xs">
              {process.env.NEXT_PUBLIC_APP_URL || "https://classyaidashboard.com"}/api/webhooks/elevenlabs-postcall
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">OpenAI Model</span>
            <Badge variant="outline">gpt-4</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

