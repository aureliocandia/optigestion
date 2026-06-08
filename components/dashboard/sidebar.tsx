"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Profile } from "@/lib/types"
import {
  LayoutDashboard, Users, FileText,
  DollarSign, Glasses, ShoppingCart, Menu, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface DashboardSidebarProps {
  profile: Profile | null
}

const navigation = [
  { name: "Dashboard",  href: "/dashboard",          icon: LayoutDashboard },
  { name: "Clientes",   href: "/dashboard/clientes",  icon: Users },
  { name: "Recetas",    href: "/dashboard/recetas",   icon: FileText },
  { name: "Ventas",     href: "/dashboard/ventas",    icon: DollarSign },
  { name: "Compras",    href: "/dashboard/compras",   icon: ShoppingCart },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {navigation.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href))
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

function UserFooter({ profile }: { profile: Profile | null }) {
  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium">
          {profile?.nombre?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex-1 truncate">
          <p className="text-sm font-medium truncate">{profile?.nombre || "Usuario"}</p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{profile?.rol || "empleado"}</p>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* ── Botón hamburguesa — visible solo en móvil ── */}
      <div className="fixed top-3 left-3 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="h-9 w-9 bg-background shadow-sm"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </div>

      {/* ── Sidebar móvil (Sheet) ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground">
          <SheetHeader className="flex flex-row items-center gap-3 border-b border-sidebar-border px-6 h-16">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
              <Glasses className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <SheetTitle className="text-lg font-semibold text-sidebar-foreground">
              OptiGestion
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-4rem)]">
            <div className="flex-1">
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <UserFooter profile={profile} />
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Sidebar desktop — igual que antes ── */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Glasses className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold">OptiGestion</h1>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex-1">
            <NavLinks pathname={pathname} />
          </div>
          <UserFooter profile={profile} />
        </div>
      </aside>
    </>
  )
}