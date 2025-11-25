"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Phone, Users, LogOut, Plane, UserCog, Settings, CalendarCheck } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/calls", label: "Calls", icon: Phone, adminOnly: false },
  { href: "/leads", label: "Leads", icon: Users, adminOnly: false },
  { href: "/reservations", label: "Reservations", icon: CalendarCheck, adminOnly: false },
]

const adminNavItems = [
  { href: "/users", label: "Users", icon: UserCog, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { isAdmin } = usePermissions()

  return (
    <div className="flex w-64 flex-col border-r border-border bg-card">
      <div className="flex h-[85px] items-center justify-center gap-2 border-b border-border px-4">
        <Plane className="h-4 w-4 text-primary" />
        <h1 className="text-lg font-semibold whitespace-nowrap">Voyages Classy Travel</h1>
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
        
        {isAdmin && (
          <>
            <div className="my-4 border-t border-border pt-4">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Administration
              </p>
            </div>
            {adminNavItems.map((item) => {
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
          </>
        )}
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

