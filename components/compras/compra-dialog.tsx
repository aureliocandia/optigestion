
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
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
import { Compra } from "@/lib/types"

interface CompraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra?: Compra | null // si se pasa, es edición
}

export function CompraDialog({ open, onOpenChange, compra }: CompraDialogProps) {
  const isEdit = !!compra
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    proveedor: compra?.proveedor || "",
    descripcion: compra?.descripcion || "",
    monto: compra?.monto?.toString() || "",
    estado: compra?.estado || "pendiente",
    fecha: compra?.fecha || new Date().toISOString().split("T")[0],
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.proveedor || !form.descripcion || !form.monto) {
      toast.error("Completá todos los campos obligatorios")
      return
    }
    setLoading(true)
    try {
      const payload = {
        proveedor: form.proveedor,
        descripcion: form.descripcion,
        monto: parseFloat(form.monto),
        estado: form.estado,
        fecha: form.fecha,
        updated_at: new Date().toISOString(),
      }

      if (isEdit) {
        const { error } = await supabase.from("compras").update(payload).eq("id", compra!.id)
        if (error) throw error
        toast.success("Compra actualizada")
      } else {
        const { error } = await supabase.from("compras").insert(payload)
        if (error) throw error
        toast.success("Compra registrada")
      }

      onOpenChange(false)
      setForm({ proveedor: "", descripcion: "", monto: "", estado: "pendiente", fecha: new Date().toISOString().split("T")[0] })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Compra" : "Nueva Compra"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proveedor">Proveedor *</Label>
            <Input id="proveedor" value={form.proveedor} onChange={(e) => set("proveedor", e.target.value)} placeholder="Nombre del proveedor" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Input id="descripcion" value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Ej: Armazones acetato x10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monto">Monto (Gs.) *</Label>
            <Input id="monto" type="number" min="1" step="any" value={form.monto} onChange={(e) => set("monto", e.target.value)} placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => set("estado", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : isEdit ? "Actualizar" : "Registrar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}