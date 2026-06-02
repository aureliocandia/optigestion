"use client"

import { Venta } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Calendar, User, FileText } from "lucide-react"

interface VentaDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venta: (Venta & { cliente: { nombre: string; apellido: string } | null }) | null
}

const estadoBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pagado: "default",
  parcial: "secondary",
  pendiente: "outline",
  cancelado: "destructive",
}

export function VentaDetailDialog({
  open,
  onOpenChange,
  venta,
}: VentaDetailDialogProps) {
  if (!venta) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const progressPercent = (venta.pagado / venta.monto) * 100
  const pendiente = venta.monto - venta.pagado

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p>Detalle de Venta</p>
              <Badge variant={estadoBadgeVariant[venta.estado]} className="mt-1">
                {venta.estado}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {venta.cliente
                ? `${venta.cliente.nombre} ${venta.cliente.apellido}`
                : "Cliente desconocido"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(venta.fecha).toLocaleDateString("es-PY", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">{venta.descripcion}</span>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Monto Total</span>
              <span className="font-semibold">{formatCurrency(venta.monto)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pagado</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(venta.pagado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pendiente</span>
              <span className="font-semibold text-rose-600">{formatCurrency(pendiente)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progreso de pago</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {venta.tipo === "credito" && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Venta a credito</p>
              <p className="text-sm font-medium">{venta.cuotas} cuotas</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
