"use client"

import { User } from "@/types/users"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { AdminGuard } from "@/components/auth/AdminGuard"
import { UserForm } from "@/components/users/user-form"
import { PermissionsEditor } from "@/components/users/permissions-editor"
import { UserStats } from "@/components/users/user-stats"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Client-safe user type with serialized dates
type SerializedUser = Omit<User, "createdAt" | "updatedAt" | "lastLoginAt"> & {
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

interface UserDetailClientProps {
  user: SerializedUser
  lastLogin: string | null
}

export function UserDetailClient({ user, lastLogin }: UserDetailClientProps) {
  return (
    <AdminGuard>
      <PageWrapper>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Link
              href="/users"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground mt-2">User profile and permissions</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserForm user={user} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <PermissionsEditor user={user} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Role</div>
                    <Badge className="mt-1">{user.role}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge className="mt-1">{user.status}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  {user.phone && (
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{user.phone}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">Last Login</div>
                    <div className="font-medium">
                      {lastLogin ? formatDistanceToNow(new Date(lastLogin), { addSuffix: true }) : "Never"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div className="font-medium">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserStats stats={user.stats} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageWrapper>
    </AdminGuard>
  )
}

