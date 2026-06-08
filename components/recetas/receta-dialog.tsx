"use client"

import { useState, useMemo } from "react"
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
import { Search } from "lucide-react"
import { toast } from "sonner"

interface ClienteOption {
  id: string
  nombre: string
  apellido: string
  cedula?: string | null
}

interface RecetaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientes: ClienteOption[]
}

const emptyForm = {
  cliente_id: "",
  esfera_od: "", cilindro_od: "", eje_od: "",
  esfera_oi: "", cilindro_oi: "", eje_oi: "",
  adicion: "", dp: "", observaciones: "",
  fecha: new Date().toISOString().split("T")[0],
}

export function RecetaDialog({ open, onOpenChange, clientes }: RecetaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [formData, setFormData] = useState(emptyForm)
  const router = useRouter()
  const supabase = createClient()

  const clientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return clientes
    const q = busqueda.toLowerCase()
    return clientes.filter((c) => {
      const nombre = `${c.nombre} ${c.apellido}`.toLowerCase()
      const codigo = c.cedula ? `#${c.cedula.replace(/\D/g, "").slice(-3)}` : ""
      return nombre.includes(q) || codigo.toLowerCase().includes(q)
    })
  }, [clientes, busqueda])

  const clienteSeleccionado = clientes.find((c) => c.id === formData.cliente_id)

  const handleClose = () => {
    onOpenChange(false)
    setBusqueda("")
    setFormData(emptyForm)
  }

  const set = (k: string, v: string) => setFormData((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from("recetas").insert({
        cliente_id: formData.cliente_id,
        esfera_od:   formData.esfera_od   ? parseFloat(formData.esfera_od)   : null,
        cilindro_od: formData.cilindro_od ? parseFloat(formData.cilindro_od) : null,
        eje_od:      formData.eje_od      ? parseInt(formData.eje_od)        : null,
        esfera_oi:   formData.esfera_oi   ? parseFloat(formData.esfera_oi)   : null,
        cilindro_oi: formData.cilindro_oi ? parseFloat(formData.cilindro_oi) : null,
        eje_oi:      formData.eje_oi      ? parseInt(formData.eje_oi)        : null,
        adicion:     formData.adicion     ? parseFloat(formData.adicion)     : null,
        dp:          formData.dp          ? parseFloat(formData.dp)          : null,
        observaciones: formData.observaciones || null,
        fecha: formData.fecha,
      })
      if (error) throw error
      toast.success("Receta creada correctamente")
      handleClose()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al crear receta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Receta</DialogTitle>
          <DialogDescription>Registra una nueva receta óptica para un cliente</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Búsqueda de cliente — igual que venta-dialog */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código (#890)..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value)
                  setFormData((f) => ({ ...f, cliente_id: "" }))
                }}
                className="pl-9"
              />
            </div>
            {busqueda && !formData.cliente_id && (
              <div className="rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                {clientesFiltrados.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground text-center">No se encontraron clientes</p>
                ) : (
                  clientesFiltrados.map((c) => {
                    const codigo = c.cedula ? `#${c.cedula.replace(/\D/g, "").slice(-3)}` : ""
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                        onClick={() => {
                          setFormData((f) => ({ ...f, cliente_id: c.id }))
                          setBusqueda(`${c.nombre} ${c.apellido}`)
                        }}
                      >
                        <span>{c.nombre} {c.apellido}</span>
                        {codigo && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{codigo}</span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            )}
            {clienteSeleccionado && (
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                <span className="font-medium">{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setFormData((f) => ({ ...f, cliente_id: "" })); setBusqueda("") }}
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha *</Label>
            <Input id="fecha" type="date" value={formData.fecha} onChange={(e) => set("fecha", e.target.value)} required />
          </div>

          {/* Ojo Derecho */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ojo Derecho (OD)</Label>
            <div className="grid grid-cols-3 gap-2">
              {[["esfera_od","Esfera","+0.00","0.25"],["cilindro_od","Cilindro","-0.00","0.25"],["eje_od","Eje","0-180","1"]].map(([k,l,ph,st])=>(
                <div key={k}>
                  <Label htmlFor={k} className="text-xs text-muted-foreground">{l}</Label>
                  <Input id={k} type="number" step={st} placeholder={ph} value={(formData as any)[k]} onChange={(e)=>set(k,e.target.value)}/>
                </div>
              ))}
            </div>
          </div>

          {/* Ojo Izquierdo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ojo Izquierdo (OI)</Label>
            <div className="grid grid-cols-3 gap-2">
              {[["esfera_oi","Esfera","+0.00","0.25"],["cilindro_oi","Cilindro","-0.00","0.25"],["eje_oi","Eje","0-180","1"]].map(([k,l,ph,st])=>(
                <div key={k}>
                  <Label htmlFor={k} className="text-xs text-muted-foreground">{l}</Label>
                  <Input id={k} type="number" step={st} placeholder={ph} value={(formData as any)[k]} onChange={(e)=>set(k,e.target.value)}/>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adicion">Adición (ADD)</Label>
              <Input id="adicion" type="number" step="0.25" placeholder="+0.00" value={formData.adicion} onChange={(e)=>set("adicion",e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dp">DP (mm)</Label>
              <Input id="dp" type="number" step="0.5" placeholder="62.0" value={formData.dp} onChange={(e)=>set("dp",e.target.value)}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" placeholder="Notas adicionales..." value={formData.observaciones} onChange={(e)=>set("observaciones",e.target.value)} rows={2}/>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || !formData.cliente_id}>{loading ? "Guardando..." : "Crear Receta"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}