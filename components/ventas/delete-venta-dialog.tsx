"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Venta } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface DeleteVentaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venta: (Venta & { cliente: { nombre: string; apellido: string } | null }) | null
}

export function DeleteVentaDialog({
  open,
  onOpenChange,
  venta,
}: DeleteVentaDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!venta) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("ventas")
        .delete()
        .eq("id", venta.id)

      if (error) throw error

      toast.success("Venta eliminada correctamente")
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar venta")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar venta</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estas seguro que deseas eliminar esta venta de{" "}
            <strong>{formatCurrency(venta?.monto || 0)}</strong> para{" "}
            <strong>
              {venta?.cliente
                ? `${venta.cliente.nombre} ${venta.cliente.apellido}`
                : "cliente desconocido"}
            </strong>
            ? Esta accion no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
