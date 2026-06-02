"use client"

import { Receta } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Eye, Calendar, User } from "lucide-react"

interface RecetaDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receta: (Receta & { cliente: { nombre: string; apellido: string } | null }) | null
}

export function RecetaDetailDialog({
  open,
  onOpenChange,
  receta,
}: RecetaDetailDialogProps) {
  if (!receta) return null

  const formatValue = (value: number | null) => {
    if (value === null) return "-"
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p>Receta Optica</p>
              <p className="text-sm font-normal text-muted-foreground">
                {receta.cliente
                  ? `${receta.cliente.nombre} ${receta.cliente.apellido}`
                  : "Cliente desconocido"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(receta.fecha).toLocaleDateString("es-PY", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <Separator />

          {/* Ojo Derecho */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Ojo Derecho (OD)</h4>
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Esfera</p>
                <p className="font-mono font-semibold">{formatValue(receta.esfera_od)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Cilindro</p>
                <p className="font-mono font-semibold">{formatValue(receta.cilindro_od)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Eje</p>
                <p className="font-mono font-semibold">{receta.eje_od ?? "-"}</p>
              </div>
            </div>
          </div>

          {/* Ojo Izquierdo */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Ojo Izquierdo (OI)</h4>
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Esfera</p>
                <p className="font-mono font-semibold">{formatValue(receta.esfera_oi)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Cilindro</p>
                <p className="font-mono font-semibold">{formatValue(receta.cilindro_oi)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Eje</p>
                <p className="font-mono font-semibold">{receta.eje_oi ?? "-"}</p>
              </div>
            </div>
          </div>

          {/* Adicionales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Adicion (ADD)</p>
              <p className="font-mono font-semibold">
                {receta.adicion ? `+${receta.adicion.toFixed(2)}` : "-"}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">DP</p>
              <p className="font-mono font-semibold">
                {receta.dp ? `${receta.dp} mm` : "-"}
              </p>
            </div>
          </div>

          {receta.observaciones && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Observaciones</h4>
              <p className="text-sm text-muted-foreground">{receta.observaciones}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
