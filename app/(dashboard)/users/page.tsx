import { getUsers } from "@/lib/firestore/users"
import { UsersPageClient } from "@/components/users/users-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UsersPage() {
  const users = await getUsers()

  const activeUsers = users.filter((u) => u.status === "active").length
  const adminCount = users.filter((u) => u.role === "admin").length
  const agentCount = users.filter((u) => u.role === "agent").length
  const managerCount = users.filter((u) => u.role === "manager").length

  return (
    <UsersPageClient
      users={users}
      activeUsers={activeUsers}
      adminCount={adminCount}
      managerCount={managerCount}
      agentCount={agentCount}
    />
  )
}

