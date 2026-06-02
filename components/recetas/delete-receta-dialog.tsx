"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Receta } from "@/lib/types"
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

interface DeleteRecetaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receta: (Receta & { cliente: { nombre: string; apellido: string } | null }) | null
}

export function DeleteRecetaDialog({
  open,
  onOpenChange,
  receta,
}: DeleteRecetaDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!receta) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("recetas")
        .delete()
        .eq("id", receta.id)

      if (error) throw error

      toast.success("Receta eliminada correctamente")
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar receta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar receta</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estas seguro que deseas eliminar esta receta de{" "}
            <strong>
              {receta?.cliente
                ? `${receta.cliente.nombre} ${receta.cliente.apellido}`
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
