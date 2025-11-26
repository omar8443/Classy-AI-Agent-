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
      <div className="flex h-screen bg-[#F0F0F0]">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}

