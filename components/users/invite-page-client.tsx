"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/motion/page-wrapper"
import { AdminGuard } from "@/components/auth/AdminGuard"
import { InviteUserForm } from "@/components/users/invite-user-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function InvitePageClient() {
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
              <h1 className="text-3xl font-bold">Invite User</h1>
              <p className="text-muted-foreground mt-2">
                Create a new user account and send invitation
              </p>
            </div>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <InviteUserForm />
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </AdminGuard>
  )
}

