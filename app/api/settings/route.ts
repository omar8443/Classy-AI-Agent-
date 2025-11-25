import { NextRequest, NextResponse } from "next/server"
import { getSettings, updateSettings } from "@/lib/firestore/settings"

export async function GET() {
  try {
    const settings = await getSettings()

    if (!settings) {
      return NextResponse.json(
        { ok: false, error: "Settings not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { updatedBy, ...settings } = body

    if (!updatedBy) {
      return NextResponse.json(
        { ok: false, error: "Missing updatedBy field" },
        { status: 400 }
      )
    }

    await updateSettings(settings, updatedBy)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

