import { getUsers } from "@/lib/firestore/users"
import { UsersPageClient } from "@/components/users/users-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UsersPage() {
  const users = await getUsers()

  // Serialize Firestore Timestamps to plain objects for client components
  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt : user.createdAt?.toDate?.() || new Date(),
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt : user.updatedAt?.toDate?.() || new Date(),
    lastLoginAt: user.lastLoginAt
      ? user.lastLoginAt instanceof Date
        ? user.lastLoginAt
        : user.lastLoginAt.toDate?.() || new Date()
      : null,
  }))

  const activeUsers = serializedUsers.filter((u) => u.status === "active").length
  const adminCount = serializedUsers.filter((u) => u.role === "admin").length
  const agentCount = serializedUsers.filter((u) => u.role === "agent").length
  const managerCount = serializedUsers.filter((u) => u.role === "manager").length

  return (
    <UsersPageClient
      users={serializedUsers}
      activeUsers={activeUsers}
      adminCount={adminCount}
      managerCount={managerCount}
      agentCount={agentCount}
    />
  )
}

