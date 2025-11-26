"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Phone, Users, LogOut, Plane, UserCog, Settings, CalendarCheck, ClipboardCheck, UserPlus, UserCircle } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/calls", label: "Calls", icon: Phone, adminOnly: false },
  { href: "/calls/unassigned", label: "Agent Requested", icon: UserPlus, adminOnly: false },
  { href: "/agent-requested", label: "Assigned to Me", icon: ClipboardCheck, adminOnly: false },
  { href: "/leads", label: "Leads", icon: Users, adminOnly: false },
  { href: "/reservations", label: "Reservations", icon: CalendarCheck, adminOnly: false },
  { href: "/profile", label: "Profile", icon: UserCircle, adminOnly: false },
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
    <aside className="w-56 bg-[#1A1A1A] text-white flex flex-col h-screen rounded-r-3xl">
      {/* Logo & Title */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">Voyages</span>
            <span className="text-sm font-bold leading-tight">Classy</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isNavItemActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
        
        {isAdmin && (
          <>
            <div className="my-3 pt-3">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Bottom - Settings */}
      <div className="p-3 mt-auto">
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 text-sm font-medium hover:text-white hover:bg-white/5 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

