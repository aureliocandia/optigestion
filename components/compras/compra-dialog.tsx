
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Compra } from "@/lib/types"

interface CompraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra?: Compra | null
}

const emptyForm = {
  proveedor: "",
  descripcion: "",
  monto: "",
  tipo: "contado",
  cuotas: "1",
  entrega: "0",
  numero_factura: "",
  fecha: new Date().toISOString().split("T")[0],
}

export function CompraDialog({ open, onOpenChange, compra }: CompraDialogProps) {
  const isEdit = !!compra
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(compra ? {
        proveedor: compra.proveedor,
        descripcion: compra.descripcion,
        monto: compra.monto.toString(),
        tipo: compra.tipo,
        cuotas: compra.cuotas.toString(),
        entrega: compra.pagado.toString(),
        numero_factura: compra.numero_factura || "",
        fecha: compra.fecha,
      } : emptyForm)
    }
  }, [open, compra])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const monto = parseFloat(form.monto) || 0
  const entrega = parseFloat(form.entrega) || 0
  const saldo = Math.max(monto - entrega, 0)
  const cuotaVal = form.cuotas && parseInt(form.cuotas) > 0
    ? Math.round(saldo / parseInt(form.cuotas)) : 0

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", minimumFractionDigits: 0 }).format(n)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.proveedor || !form.descripcion || !form.monto) {
      toast.error("Completá todos los campos obligatorios")
      return
    }
    setLoading(true)
    try {
      const pagado = form.tipo === "contado" ? monto : entrega
      const estado = form.tipo === "contado" ? "pagado"
        : pagado >= monto ? "pagado" : pagado > 0 ? "parcial" : "pendiente"

      const payload = {
        proveedor: form.proveedor,
        descripcion: form.descripcion,
        monto,
        pagado,
        tipo: form.tipo,
        cuotas: parseInt(form.cuotas),
        estado,
        numero_factura: form.numero_factura || null,
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
            <Label>Proveedor *</Label>
            <Input value={form.proveedor} onChange={(e) => set("proveedor", e.target.value)} placeholder="Nombre del proveedor" />
          </div>
          <div className="space-y-2">
            <Label>Descripción *</Label>
            <Input value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Ej: Armazones acetato x10" />
          </div>
          <div className="space-y-2">
            <Label>N° de Factura</Label>
            <Input
              value={form.numero_factura}
              onChange={(e) => set("numero_factura", e.target.value)}
              placeholder="Ej: 001-001-0001234"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monto total (Gs.) *</Label>
              <Input type="number" min="1" step="any" value={form.monto} onChange={(e) => set("monto", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contado">Contado</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.tipo === "credito" && (
              <div className="space-y-2">
                <Label>Cuotas</Label>
                <Input type="number" min="1" value={form.cuotas} onChange={(e) => set("cuotas", e.target.value)} />
              </div>
            )}
          </div>

          {form.tipo === "credito" && (
            <>
              <div className="space-y-2">
                <Label>Entrega inicial (Gs.)</Label>
                <Input type="number" min="0" step="any" value={form.entrega} onChange={(e) => set("entrega", e.target.value)} placeholder="0" />
              </div>
              {monto > 0 && (
                <div className="rounded-md bg-muted px-3 py-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{fmt(monto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrega inicial:</span>
                    <span className="font-medium text-emerald-600">- {fmt(entrega)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-muted-foreground">Saldo en cuotas:</span>
                    <span className="font-semibold">{fmt(saldo)}</span>
                  </div>
                  {cuotaVal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor por cuota:</span>
                      <span className="font-semibold text-blue-600">{fmt(cuotaVal)}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : isEdit ? "Actualizar" : "Registrar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}