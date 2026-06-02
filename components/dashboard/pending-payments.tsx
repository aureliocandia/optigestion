import Link from "next/link"
import { Venta } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertCircle } from "lucide-react"

interface PendingPaymentsProps {
  payments: (Venta & { cliente: { nombre: string; apellido: string } | null })[]
}

export function PendingPayments({ payments }: PendingPaymentsProps) {
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
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Cobranzas Pendientes
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/ventas?estado=pendiente">
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No hay pagos pendientes
          </p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const pendiente = payment.monto - payment.pagado
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {payment.cliente
                        ? `${payment.cliente.nombre} ${payment.cliente.apellido}`
                        : "Cliente desconocido"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fecha: {new Date(payment.fecha).toLocaleDateString("es-PY")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-rose-600">
                      {formatCurrency(pendiente)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      de {formatCurrency(payment.monto)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
