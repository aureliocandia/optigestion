import { DashboardStats as Stats } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, Clock, TrendingUp, DollarSign, AlertCircle } from "lucide-react"

interface DashboardStatsProps {
  stats: Stats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const statCards = [
    {
      title: "Total Clientes",
      value: stats.totalClientes.toString(),
      icon: Users,
      description: "Clientes registrados",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Ventas del Mes",
      value: formatCurrency(stats.ingresosMes),
      icon: TrendingUp,
      description: "Ingresos este mes",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Ventas Hoy",
      value: stats.ventasHoy.toString(),
      icon: ShoppingCart,
      description: "Transacciones del dia",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Por Cobrar",
      value: formatCurrency(stats.cobranzaPendiente),
      icon: DollarSign,
      description: `${stats.ventasPendientes} ventas pendientes`,
      color: "text-rose-600",
      bgColor: "bg-rose-100",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
