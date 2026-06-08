"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Compra } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface RegistrarPagoCompraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra: Compra | null
}

export function RegistrarPagoCompraDialog({
  open, onOpenChange, compra,
}: RegistrarPagoCompraDialogProps) {
  const [monto, setMonto] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (!compra) return null

  const pendiente = compra.monto - compra.pagado
  const progressPercent = (compra.pagado / compra.monto) * 100

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-PY", {
      style: "currency", currency: "PYG", minimumFractionDigits: 0,
    }).format(n)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pagoMonto = parseFloat(monto)
    if (pagoMonto <= 0 || pagoMonto > pendiente) {
      toast.error("El monto debe ser mayor a 0 y menor o igual al pendiente")
      return
    }
    setLoading(true)
    try {
      const nuevoPagado = compra.pagado + pagoMonto
      const nuevoEstado = nuevoPagado >= compra.monto ? "pagado" : "parcial"

      const { error } = await supabase
        .from("compras")
        .update({
          pagado: nuevoPagado,
          estado: nuevoEstado,
          updated_at: new Date().toISOString(),
        })
        .eq("id", compra.id)

      if (error) throw error

      toast.success(nuevoEstado === "pagado" ? "Compra pagada completamente" : "Pago registrado correctamente")
      onOpenChange(false)
      setMonto("")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al registrar pago")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setMonto("") }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pago — Compra</DialogTitle>
          <DialogDescription>{compra.proveedor} · {compra.descripcion}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{fmt(compra.monto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pagado</span>
              <span className="font-medium text-emerald-600">{fmt(compra.pagado)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pendiente</span>
              <span className="font-semibold text-rose-600">{fmt(pendiente)}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monto-compra">Monto a pagar (Gs.)</Label>
              <div className="flex gap-2">
                <Input
                  id="monto-compra"
                  type="number"
                  min="1"
                  max={pendiente}
                  step="any"
                  placeholder={pendiente.toString()}
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
                <Button type="button" variant="outline" onClick={() => setMonto(pendiente.toString())}>
                  Pagar todo
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading || !monto}>
                {loading ? "Procesando..." : "Registrar Pago"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}