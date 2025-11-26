/**
 * Sync Admin Claims Script
 * 
 * This script synchronizes user roles from Firestore to Firebase Auth custom claims.
 * Run this if you've manually updated user roles in Firestore Console and users
 * can't access admin-only features.
 * 
 * Usage:
 *   npx tsx scripts/sync-admin-claims.ts
 * 
 * Or add to package.json:
 *   "scripts": {
 *     "sync-claims": "tsx scripts/sync-admin-claims.ts"
 *   }
 */

import { getFirebaseAdmin } from "../lib/firebaseAdmin"

async function syncAdminClaims() {
  try {
    console.log("🔄 Starting to sync user roles to custom claims...\n")

    const { db, auth } = getFirebaseAdmin()

    // Get all users from Firestore
    const usersSnapshot = await db.collection("users").get()

    if (usersSnapshot.empty) {
      console.log("⚠️  No users found in Firestore")
      return
    }

    console.log(`📋 Found ${usersSnapshot.size} users to process\n`)

    let successCount = 0
    let errorCount = 0

    for (const doc of usersSnapshot.docs) {
      const userId = doc.id
      const userData = doc.data()
      const role = userData.role || "agent"

      try {
        // Set custom claims in Firebase Auth
        await auth.setCustomUserClaims(userId, { role })

        console.log(
          `✅ ${userData.email || userId} → role: ${role} ${
            role === "admin" ? "👑" : ""
          }`
        )
        successCount++
      } catch (error) {
        console.error(
          `❌ Failed to update ${userData.email || userId}:`,
          error instanceof Error ? error.message : "Unknown error"
        )
        errorCount++
      }
    }

    console.log("\n" + "=".repeat(50))
    console.log(`✅ Successfully updated: ${successCount}`)
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount}`)
    }
    console.log("=".repeat(50))
    console.log(
      "\n⚠️  Important: Users must sign out and sign back in for changes to take effect!"
    )
  } catch (error) {
    console.error("❌ Script failed:", error)
    process.exit(1)
  }
}

// Run the script
syncAdminClaims()
  .then(() => {
    console.log("\n🎉 Sync completed successfully!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Sync failed:", error)
    process.exit(1)
  })

