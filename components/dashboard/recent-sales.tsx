import Link from "next/link"
import { Venta } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface RecentSalesProps {
  sales: (Venta & { cliente: { nombre: string; apellido: string } | null })[]
}

const estadoBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pagado: "default",
  parcial: "secondary",
  pendiente: "outline",
  cancelado: "destructive",
}

export function RecentSales({ sales }: RecentSalesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ventas Recientes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/ventas">
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No hay ventas recientes
          </p>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {sale.cliente
                      ? `${sale.cliente.nombre} ${sale.cliente.apellido}`
                      : "Cliente desconocido"}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {sale.descripcion}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={estadoBadgeVariant[sale.estado]}>
                    {sale.estado}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {formatCurrency(sale.monto)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
