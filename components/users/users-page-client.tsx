"use client"

import { User } from "@/types/users"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersTable } from "@/components/users/users-table"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { AdminGuard } from "@/components/auth/AdminGuard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

// Client-safe user type with serialized dates
type SerializedUser = Omit<User, "createdAt" | "updatedAt" | "lastLoginAt"> & {
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

interface UsersPageClientProps {
  users: SerializedUser[]
  activeUsers: number
  adminCount: number
  managerCount: number
  agentCount: number
}

export function UsersPageClient({
  users,
  activeUsers,
  adminCount,
  managerCount,
  agentCount,
}: UsersPageClientProps) {
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

