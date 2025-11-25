"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Download } from "lucide-react"

export function ExportData() {
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleExport = async (type: "leads" | "calls" | "reservations", format: "csv" | "json") => {
    setLoading(`${type}-${format}`)

    try {
      const response = await fetch(`/api/export/${type}?format=${format}`)
      
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-export-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful",
        description: `${type} data has been downloaded.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Export failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h4 className="font-medium">Leads</h4>
            <p className="text-sm text-muted-foreground">Export all lead data</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("leads", "csv")}
              disabled={loading === "leads-csv"}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === "leads-csv" ? "Exporting..." : "CSV"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("leads", "json")}
              disabled={loading === "leads-json"}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === "leads-json" ? "Exporting..." : "JSON"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h4 className="font-medium">Calls</h4>
            <p className="text-sm text-muted-foreground">Export all call records</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("calls", "csv")}
              disabled={loading === "calls-csv"}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === "calls-csv" ? "Exporting..." : "CSV"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("calls", "json")}
              disabled={loading === "calls-json"}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === "calls-json" ? "Exporting..." : "JSON"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h4 className="font-medium">Reservations</h4>
            <p className="text-sm text-muted-foreground">Export all reservations</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("reservations", "csv")}
              disabled={loading === "reservations-csv"}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === "reservations-csv" ? "Exporting..." : "CSV"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("reservations", "json")}
              disabled={loading === "reservations-json"}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading === "reservations-json" ? "Exporting..." : "JSON"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2">Note:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>CSV format is ideal for Excel/Google Sheets</li>
          <li>JSON format includes all nested data</li>
          <li>Exports include all records (not filtered)</li>
        </ul>
      </div>
    </div>
  )
}

