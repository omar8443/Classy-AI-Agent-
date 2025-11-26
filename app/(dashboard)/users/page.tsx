import { getUsers } from "@/lib/firestore/users"
import { UsersPageClient } from "@/components/users/users-page-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UsersPage() {
  const users = await getUsers()

  // Deep serialize to plain JSON objects
  const serializedUsers = JSON.parse(JSON.stringify(users))

  const adminCount = serializedUsers.filter((u: any) => u.role === "admin").length
  const agentCount = serializedUsers.filter((u: any) => u.role === "agent").length
  const managerCount = serializedUsers.filter((u: any) => u.role === "manager").length

  return (
    <UsersPageClient
      users={serializedUsers}
      adminCount={adminCount}
      managerCount={managerCount}
      agentCount={agentCount}
    />
  )
}

