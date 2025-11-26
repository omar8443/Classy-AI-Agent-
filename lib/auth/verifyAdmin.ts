import { cookies, headers } from "next/headers"
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"
import { redirect } from "next/navigation"

/**
 * Verify that the current user is an admin
 * This should be used in server components and API routes
 * 
 * @param redirectOnFail - If true, redirects to home page. If false, returns null
 * @returns The user's ID if admin, null if not admin (when redirectOnFail = false)
 */
export async function verifyAdmin(
  redirectOnFail: boolean = true
): Promise<string | null> {
  try {
    const { auth } = getFirebaseAdmin()
    const headersList = headers()
    
    // Try to get session token from cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")
    
    if (sessionCookie) {
      try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie.value)
        const role = decodedClaims.role as string | undefined
        
        if (role === "admin") {
          return decodedClaims.uid
        }
      } catch (error) {
        console.error("Session cookie verification failed:", error)
      }
    }
    
    // Try to get token from Authorization header (for API routes)
    const authHeader = headersList.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split("Bearer ")[1]
        const decodedToken = await auth.verifyIdToken(token)
        const role = decodedToken.role as string | undefined
        
        if (role === "admin") {
          return decodedToken.uid
        }
      } catch (error) {
        console.error("Token verification failed:", error)
      }
    }
    
    // Not authenticated as admin
    if (redirectOnFail) {
      redirect("/")
    }
    return null
  } catch (error) {
    console.error("Admin verification error:", error)
    if (redirectOnFail) {
      redirect("/")
    }
    return null
  }
}

/**
 * Verify admin access for API routes
 * Throws an error if not admin (for use with try/catch in API routes)
 */
export async function verifyAdminAPI(request: Request): Promise<string> {
  const { auth } = getFirebaseAdmin()
  
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized - No token provided")
  }

  const token = authHeader.split("Bearer ")[1]
  const decodedToken = await auth.verifyIdToken(token)
  const role = decodedToken.role as string | undefined

  if (role !== "admin") {
    throw new Error("Forbidden - Admin access required")
  }

  return decodedToken.uid
}

