"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Cliente } from "@/lib/types"
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

interface DeleteClienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: Cliente | null
}

export function DeleteClienteDialog({
  open,
  onOpenChange,
  cliente,
}: DeleteClienteDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!cliente) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", cliente.id)

      if (error) throw error

      toast.success("Cliente eliminado correctamente")
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estas seguro que deseas eliminar a{" "}
            <strong>{cliente?.nombre} {cliente?.apellido}</strong>? Esta accion
            eliminara tambien todas sus recetas y ventas asociadas.
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
