"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Phone, Users, LogOut, Plane } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/calls", label: "Calls", icon: Phone },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <div className="flex w-64 flex-col border-r border-border bg-card">
      <div className="flex h-20 items-center justify-center gap-3 border-b border-border px-6">
        <Plane className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold whitespace-nowrap">Voyage Classy Travel</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => signOut()}>
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  )
}

