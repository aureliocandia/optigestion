"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface ClienteOption {
  id: string
  nombre: string
  apellido: string
}

interface VentaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientes: ClienteOption[]
}

export function VentaDialog({ open, onOpenChange, clientes }: VentaDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    cliente_id: "",
    descripcion: "",
    monto: "",
    tipo: "contado" as "contado" | "credito",
    cuotas: "1",
    fecha: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const monto = parseFloat(formData.monto)
    const estado = formData.tipo === "contado" ? "pagado" : "pendiente"
    const pagado = formData.tipo === "contado" ? monto : 0

    try {
      const { error } = await supabase.from("ventas").insert({
        cliente_id: formData.cliente_id,
        descripcion: formData.descripcion,
        monto,
        pagado,
        estado,
        tipo: formData.tipo,
        cuotas: parseInt(formData.cuotas),
        fecha: formData.fecha,
      })

      if (error) throw error

      toast.success("Venta registrada correctamente")
      onOpenChange(false)
      setFormData({
        cliente_id: "",
        descripcion: "",
        monto: "",
        tipo: "contado",
        cuotas: "1",
        fecha: new Date().toISOString().split("T")[0],
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al registrar venta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>
            Registra una nueva venta para un cliente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripcion *</Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Lentes bifocales + armazon Ray-Ban"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto Total (Gs.) *</Label>
              <Input
                id="monto"
                type="number"
                min="0"
                step="1000"
                placeholder="500000"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Venta</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "contado" | "credito") => 
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contado">Contado</SelectItem>
                  <SelectItem value="credito">Credito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.tipo === "credito" && (
              <div className="space-y-2">
                <Label htmlFor="cuotas">Cuotas</Label>
                <Input
                  id="cuotas"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.cuotas}
                  onChange={(e) => setFormData({ ...formData, cuotas: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.cliente_id || !formData.monto}>
              {loading ? "Guardando..." : "Registrar Venta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
