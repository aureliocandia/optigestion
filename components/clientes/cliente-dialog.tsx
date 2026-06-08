
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Cliente } from "@/lib/types"
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
import { toast } from "sonner"

interface ClienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: Cliente | null
}

const emptyForm = {
  nombre: "",
  apellido: "",
  cedula: "",
  telefono: "",
  email: "",
  direccion: "",
}

// Genera código visible: últimos 3 dígitos de cédula o primeras 3 letras del apellido
function generarCodigo(cedula: string, apellido: string): string {
  if (cedula && cedula.replace(/\D/g, "").length >= 3) {
    const nums = cedula.replace(/\D/g, "")
    return `#${nums.slice(-3)}`
  }
  return `#${apellido.slice(0, 3).toUpperCase().padEnd(3, "X")}`
}

export function ClienteDialog({ open, onOpenChange, cliente }: ClienteDialogProps) {
  const isEditing = !!cliente
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState(emptyForm)

  // ✅ FIX punto 3: sincroniza correctamente cuando cambia el cliente
  useEffect(() => {
    if (open) {
      setFormData(
        cliente
          ? {
              nombre: cliente.nombre,
              apellido: cliente.apellido,
              cedula: cliente.cedula || "",
              telefono: cliente.telefono || "",
              email: cliente.email || "",
              direccion: cliente.direccion || "",
            }
          : emptyForm
      )
    }
  }, [open, cliente])

  const codigoPreview = generarCodigo(formData.cedula, formData.apellido)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula || null,
        telefono: formData.telefono || null,
        email: formData.email || null,
        direccion: formData.direccion || null,
        codigo: codigoPreview, // guardamos el código en la BD
        updated_at: new Date().toISOString(),
      }

      if (isEditing && cliente) {
        const { error } = await supabase
          .from("clientes")
          .update(payload)
          .eq("id", cliente.id)
        if (error) throw error
        toast.success("Cliente actualizado correctamente")
      } else {
        const { error } = await supabase.from("clientes").insert(payload)
        if (error) throw error
        toast.success("Cliente creado correctamente")
      }

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al guardar cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
            {/* Punto 1: muestra el código del cliente */}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {codigoPreview}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modificá solo los campos que necesitás cambiar"
              : "Completá los datos para registrar un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cedula">
                Cédula
                <span className="ml-1 text-xs text-muted-foreground">(genera el código)</span>
              </Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                placeholder="Ej: 4.567.890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
