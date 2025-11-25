import { NextRequest, NextResponse } from "next/server"
import { getLeads } from "@/lib/firestore/leads"
import { getCalls } from "@/lib/firestore/calls"

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"
    const type = params.type

    let data: any[] = []

    switch (type) {
      case "leads":
        data = await getLeads()
        break
      case "calls":
        data = await getCalls()
        break
      case "reservations":
        // TODO: Implement when reservations are added
        data = []
        break
      default:
        return NextResponse.json(
          { ok: false, error: "Invalid export type" },
          { status: 400 }
        )
    }

    if (format === "csv") {
      const csv = convertToCSV(data)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-export.csv"`,
        },
      })
    } else {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${type}-export.json"`,
        },
      })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const rows = data.map((item) =>
    headers.map((header) => {
      const value = item[header]
      if (value === null || value === undefined) return ""
      if (typeof value === "object") return JSON.stringify(value)
      return String(value).replace(/"/g, '""')
    })
  )

  const csvHeaders = headers.join(",")
  const csvRows = rows.map((row) => row.map((cell) => `"${cell}"`).join(","))

  return [csvHeaders, ...csvRows].join("\n")
}

