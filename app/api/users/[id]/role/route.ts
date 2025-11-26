import { NextRequest, NextResponse } from "next/server"
import { updateUserRole } from "@/lib/firestore/users"
import { UserRole } from "@/types/users"
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.split("Bearer ")[1]
    const { auth } = getFirebaseAdmin()

    // Verify the token and check if user is admin
    const decodedToken = await auth.verifyIdToken(token)
    const userRole = decodedToken.role as string | undefined

    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Get the new role from request body
    const { role } = await request.json()

    if (!role || !["admin", "manager", "agent", "viewer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be: admin, manager, agent, or viewer" },
        { status: 400 }
      )
    }

    // Update the user's role (this updates both Firestore and custom claims)
    await updateUserRole(params.id, role as UserRole)

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}. User must sign out and sign back in for changes to take effect.`,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      {
        error: "Failed to update user role",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

