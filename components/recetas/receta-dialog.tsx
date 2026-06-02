"use client"

import { useState, useEffect } from "react"
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

interface RecetaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientes: ClienteOption[]
}

export function RecetaDialog({ open, onOpenChange, clientes }: RecetaDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    cliente_id: "",
    esfera_od: "",
    cilindro_od: "",
    eje_od: "",
    esfera_oi: "",
    cilindro_oi: "",
    eje_oi: "",
    adicion: "",
    dp: "",
    observaciones: "",
    fecha: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("recetas").insert({
        cliente_id: formData.cliente_id,
        esfera_od: formData.esfera_od ? parseFloat(formData.esfera_od) : null,
        cilindro_od: formData.cilindro_od ? parseFloat(formData.cilindro_od) : null,
        eje_od: formData.eje_od ? parseInt(formData.eje_od) : null,
        esfera_oi: formData.esfera_oi ? parseFloat(formData.esfera_oi) : null,
        cilindro_oi: formData.cilindro_oi ? parseFloat(formData.cilindro_oi) : null,
        eje_oi: formData.eje_oi ? parseInt(formData.eje_oi) : null,
        adicion: formData.adicion ? parseFloat(formData.adicion) : null,
        dp: formData.dp ? parseFloat(formData.dp) : null,
        observaciones: formData.observaciones || null,
        fecha: formData.fecha,
      })

      if (error) throw error

      toast.success("Receta creada correctamente")
      onOpenChange(false)
      setFormData({
        cliente_id: "",
        esfera_od: "",
        cilindro_od: "",
        eje_od: "",
        esfera_oi: "",
        cilindro_oi: "",
        eje_oi: "",
        adicion: "",
        dp: "",
        observaciones: "",
        fecha: new Date().toISOString().split("T")[0],
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al crear receta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Receta</DialogTitle>
          <DialogDescription>
            Registra una nueva receta optica para un cliente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
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

          {/* Ojo Derecho */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ojo Derecho (OD)</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="esfera_od" className="text-xs text-muted-foreground">Esfera</Label>
                <Input
                  id="esfera_od"
                  type="number"
                  step="0.25"
                  placeholder="+0.00"
                  value={formData.esfera_od}
                  onChange={(e) => setFormData({ ...formData, esfera_od: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cilindro_od" className="text-xs text-muted-foreground">Cilindro</Label>
                <Input
                  id="cilindro_od"
                  type="number"
                  step="0.25"
                  placeholder="-0.00"
                  value={formData.cilindro_od}
                  onChange={(e) => setFormData({ ...formData, cilindro_od: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="eje_od" className="text-xs text-muted-foreground">Eje</Label>
                <Input
                  id="eje_od"
                  type="number"
                  min="0"
                  max="180"
                  placeholder="0-180"
                  value={formData.eje_od}
                  onChange={(e) => setFormData({ ...formData, eje_od: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Ojo Izquierdo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ojo Izquierdo (OI)</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="esfera_oi" className="text-xs text-muted-foreground">Esfera</Label>
                <Input
                  id="esfera_oi"
                  type="number"
                  step="0.25"
                  placeholder="+0.00"
                  value={formData.esfera_oi}
                  onChange={(e) => setFormData({ ...formData, esfera_oi: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cilindro_oi" className="text-xs text-muted-foreground">Cilindro</Label>
                <Input
                  id="cilindro_oi"
                  type="number"
                  step="0.25"
                  placeholder="-0.00"
                  value={formData.cilindro_oi}
                  onChange={(e) => setFormData({ ...formData, cilindro_oi: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="eje_oi" className="text-xs text-muted-foreground">Eje</Label>
                <Input
                  id="eje_oi"
                  type="number"
                  min="0"
                  max="180"
                  placeholder="0-180"
                  value={formData.eje_oi}
                  onChange={(e) => setFormData({ ...formData, eje_oi: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Adicionales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adicion">Adicion (ADD)</Label>
              <Input
                id="adicion"
                type="number"
                step="0.25"
                placeholder="+0.00"
                value={formData.adicion}
                onChange={(e) => setFormData({ ...formData, adicion: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dp">DP (mm)</Label>
              <Input
                id="dp"
                type="number"
                step="0.5"
                placeholder="62.0"
                value={formData.dp}
                onChange={(e) => setFormData({ ...formData, dp: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales..."
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.cliente_id}>
              {loading ? "Guardando..." : "Crear Receta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
