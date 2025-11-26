import { NextRequest, NextResponse } from "next/server"
import { getUsers } from "@/lib/firestore/users"

/**
 * Get all users - useful for assigning calls
 * Supports filtering by role via query param: ?role=agent
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get("role")

    let users = await getUsers()

    // Filter by role if specified
    if (roleFilter) {
      users = users.filter((user) => user.role === roleFilter)
    }

    // Return simplified user data for dropdowns
    const simplifiedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    }))

    return NextResponse.json(simplifiedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
