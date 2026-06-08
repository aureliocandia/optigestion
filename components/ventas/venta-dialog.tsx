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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { toast } from "sonner"

interface ClienteOption {
  id: string
  nombre: string
  apellido: string
  cedula?: string | null
}

interface VentaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientes: ClienteOption[]
}

export function VentaDialog({ open, onOpenChange, clientes }: VentaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [busquedaCliente, setBusquedaCliente] = useState("")
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

  // Filtra clientes por nombre, apellido o últimos 3 dígitos de cédula
  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente.trim()) return clientes
    const q = busquedaCliente.toLowerCase()
    return clientes.filter((c) => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase()
      const codigoCedula = c.cedula
        ? `#${c.cedula.replace(/\D/g, "").slice(-3)}`
        : ""
      return (
        nombreCompleto.includes(q) ||
        codigoCedula.toLowerCase().includes(q)
      )
    })
  }, [clientes, busquedaCliente])

  const clienteSeleccionado = clientes.find((c) => c.id === formData.cliente_id)

  const handleClose = () => {
    onOpenChange(false)
    setBusquedaCliente("")
    setFormData({
      cliente_id: "",
      descripcion: "",
      monto: "",
      tipo: "contado",
      cuotas: "1",
      fecha: new Date().toISOString().split("T")[0],
    })
  }

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
      handleClose()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al registrar venta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>
            Registra una nueva venta para un cliente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Búsqueda de cliente */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código (#890)..."
                value={busquedaCliente}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value)
                  setFormData({ ...formData, cliente_id: "" })
                }}
                className="pl-9"
              />
            </div>

            {/* Lista de resultados */}
            {busquedaCliente && !formData.cliente_id && (
              <div className="rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                {clientesFiltrados.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground text-center">
                    No se encontraron clientes
                  </p>
                ) : (
                  clientesFiltrados.map((c) => {
                    const codigo = c.cedula
                      ? `#${c.cedula.replace(/\D/g, "").slice(-3)}`
                      : ""
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                        onClick={() => {
                          setFormData({ ...formData, cliente_id: c.id })
                          setBusquedaCliente(`${c.nombre} ${c.apellido}`)
                        }}
                      >
                        <span>{c.nombre} {c.apellido}</span>
                        {codigo && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {codigo}
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            )}

            {/* Cliente seleccionado */}
            {clienteSeleccionado && (
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                <span className="font-medium">
                  {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                </span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setFormData({ ...formData, cliente_id: "" })
                    setBusquedaCliente("")
                  }}
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Lentes bifocales + armazón Ray-Ban"
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
                step="any"
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
              <Label>Tipo de Venta</Label>
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
                  <SelectItem value="credito">Crédito</SelectItem>
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
            <Button type="button" variant="outline" onClick={handleClose}>
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