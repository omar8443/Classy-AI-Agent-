"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Phone, Users, LogOut, Plane, UserCog, Settings, CalendarCheck, ClipboardCheck, UserPlus } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/calls", label: "Calls", icon: Phone, adminOnly: false },
  { href: "/calls/unassigned", label: "Requested Agent", icon: UserPlus, adminOnly: false },
  { href: "/agent-requested", label: "Assigned to Me", icon: ClipboardCheck, adminOnly: false },
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

  const isNavItemActive = (itemHref: string) => {
    // Exact match
    if (pathname === itemHref) return true
    
    // Special case for root
    if (itemHref === "/") return false
    
    // Special case for /calls - only match /calls/[id] but not /calls/unassigned
    if (itemHref === "/calls") {
      return pathname.startsWith("/calls/") && !pathname.startsWith("/calls/unassigned")
    }
    
    // For other routes, match if pathname starts with href
    return pathname.startsWith(itemHref)
  }

  return (
    <div className="flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-[72px] items-center justify-center gap-2 border-b border-border px-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Plane className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-base font-bold whitespace-nowrap">Voyages Classy</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isNavItemActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
        
        {isAdmin && (
          <>
            <div className="my-3 border-t border-border pt-3">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Administration
              </p>
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isNavItemActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>
      <div className="border-t border-border p-3">
        <Button variant="ghost" className="w-full justify-start gap-3 text-sm font-medium" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}

