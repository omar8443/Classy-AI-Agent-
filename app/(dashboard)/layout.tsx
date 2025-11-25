"use client"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50 text-gray-900">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col border-l border-gray-200 bg-white">
          <DashboardTopBar />
          <main className="flex-1 overflow-y-auto bg-white p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}

