"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Profile } from "@/lib/types"
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Glasses,
  ShoppingCart,
} from "lucide-react"

interface DashboardSidebarProps {
  profile: Profile | null
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/dashboard/clientes", icon: Users },
  { name: "Recetas", href: "/dashboard/recetas", icon: FileText },
  { name: "Ventas", href: "/dashboard/ventas", icon: DollarSign },
  { name: "Compras", href: "/dashboard/compras", icon: ShoppingCart },
]

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Glasses className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">OptiGestion</h1>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 w-64 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium">
            {profile?.nombre?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{profile?.nombre || "Usuario"}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{profile?.rol || "empleado"}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
