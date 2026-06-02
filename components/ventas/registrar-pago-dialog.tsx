"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Venta } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface RegistrarPagoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venta: (Venta & { cliente: { nombre: string; apellido: string } | null }) | null
}

export function RegistrarPagoDialog({
  open,
  onOpenChange,
  venta,
}: RegistrarPagoDialogProps) {
  const [loading, setLoading] = useState(false)
  const [monto, setMonto] = useState("")
  const router = useRouter()
  const supabase = createClient()

  if (!venta) return null

  const pendiente = venta.monto - venta.pagado
  const progressPercent = (venta.pagado / venta.monto) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const pagoMonto = parseFloat(monto)
    if (pagoMonto <= 0 || pagoMonto > pendiente) {
      toast.error("El monto debe ser mayor a 0 y menor o igual al pendiente")
      setLoading(false)
      return
    }

    const nuevoPagado = venta.pagado + pagoMonto
    const nuevoEstado = nuevoPagado >= venta.monto ? "pagado" : "parcial"

    try {
      const { error } = await supabase
        .from("ventas")
        .update({
          pagado: nuevoPagado,
          estado: nuevoEstado,
          updated_at: new Date().toISOString(),
        })
        .eq("id", venta.id)

      if (error) throw error

      toast.success(
        nuevoEstado === "pagado"
          ? "Venta pagada completamente"
          : "Pago registrado correctamente"
      )
      onOpenChange(false)
      setMonto("")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al registrar pago")
    } finally {
      setLoading(false)
    }
  }

  const handlePayFull = () => {
    setMonto(pendiente.toString())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            {venta.cliente
              ? `${venta.cliente.nombre} ${venta.cliente.apellido}`
              : "Cliente desconocido"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{formatCurrency(venta.monto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pagado</span>
              <span className="font-medium text-emerald-600">{formatCurrency(venta.pagado)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pendiente</span>
              <span className="font-semibold text-rose-600">{formatCurrency(pendiente)}</span>
            </div>
            <div className="pt-2">
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto a pagar (Gs.)</Label>
              <div className="flex gap-2">
                <Input
                  id="monto"
                  type="number"
                  min="1"
                  max={pendiente}
                  step="any"
                  placeholder={pendiente.toString()}
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
                <Button type="button" variant="outline" onClick={handlePayFull}>
                  Pagar todo
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
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