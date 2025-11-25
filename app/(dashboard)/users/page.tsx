import { getUsers } from "@/lib/firestore/users"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersTable } from "@/components/users/users-table"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { AdminGuard } from "@/components/auth/AdminGuard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UsersPage() {
  const users = await getUsers()

  const activeUsers = users.filter((u) => u.status === "active").length
  const adminCount = users.filter((u) => u.role === "admin").length
  const agentCount = users.filter((u) => u.role === "agent").length
  const managerCount = users.filter((u) => u.role === "manager").length

  return (
    <AdminGuard>
      <PageWrapper>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Users</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage user accounts and permissions
              </p>
            </div>
            <Link href="/users/invite">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">{activeUsers} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{managerCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agentCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable users={users} />
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </AdminGuard>
  )
}

