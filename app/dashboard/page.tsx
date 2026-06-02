import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { PendingPayments } from "@/components/dashboard/pending-payments"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get statistics
  const [
    { count: totalClientes },
    { count: totalVentas },
    { data: ventasData },
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("ventas").select("*", { count: "exact", head: true }),
    supabase.from("ventas").select("monto, pagado, estado, fecha"),
  ])

  const today = new Date().toISOString().split("T")[0]
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

  const ventasHoy = ventasData?.filter(v => v.fecha === today).length || 0
  const ventasPendientes = ventasData?.filter(v => v.estado === "pendiente" || v.estado === "parcial").length || 0
  const ingresosMes = ventasData
    ?.filter(v => v.fecha >= firstDayOfMonth)
    .reduce((sum, v) => sum + Number(v.monto), 0) || 0
  const cobranzaPendiente = ventasData
    ?.filter(v => v.estado !== "pagado" && v.estado !== "cancelado")
    .reduce((sum, v) => sum + (Number(v.monto) - Number(v.pagado)), 0) || 0

  const stats = {
    totalClientes: totalClientes || 0,
    totalVentas: totalVentas || 0,
    ventasPendientes,
    ventasHoy,
    ingresosMes,
    cobranzaPendiente,
  }

  // Recent sales
  const { data: recentSales } = await supabase
    .from("ventas")
    .select("*, cliente:clientes(*)")
    .order("created_at", { ascending: false })
    .limit(5)

  // Pending payments
  const { data: pendingPayments } = await supabase
    .from("ventas")
    .select("*, cliente:clientes(*)")
    .in("estado", ["pendiente", "parcial"])
    .order("fecha", { ascending: true })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de tu optica
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSales sales={recentSales || []} />
        <PendingPayments payments={pendingPayments || []} />
      </div>
    </div>
  )
}
