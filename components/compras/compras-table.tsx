"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Compra } from "@/lib/types"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Trash2, Pencil, ShoppingCart, DollarSign } from "lucide-react"
import { CompraDialog } from "./compra-dialog"
import { RegistrarPagoCompraDialog } from "./registrar-pago-compra-dialog"
import { toast } from "sonner"

const estadoVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pagado: "default",
  parcial: "secondary",
  pendiente: "outline",
  cancelado: "destructive",
}

export function ComprasTable({ compras }: { compras: Compra[] }) {
  const [editingCompra, setEditingCompra] = useState<Compra | null>(null)
  const [deletingCompra, setDeletingCompra] = useState<Compra | null>(null)
  const [payingCompra, setPayingCompra] = useState<Compra | null>(null)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", minimumFractionDigits: 0 }).format(n)

  const handleDelete = async () => {
    if (!deletingCompra) return
    setLoadingDelete(true)
    try {
      const { error } = await supabase.from("compras").delete().eq("id", deletingCompra.id)
      if (error) throw error
      toast.success("Compra eliminada")
      setDeletingCompra(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar")
    } finally {
      setLoadingDelete(false)
    }
  }

  if (compras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No hay compras</h3>
        <p className="mt-2 text-sm text-muted-foreground">Registrá tu primera compra a proveedor</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proveedor</TableHead>
              <TableHead className="hidden md:table-cell">Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead className="hidden sm:table-cell">Pagado</TableHead>
              <TableHead className="hidden lg:table-cell">Progreso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compras.map((c) => {
              const pct = c.monto > 0 ? Math.round((c.pagado / c.monto) * 100) : 0
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium">{c.proveedor}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.fecha).toLocaleDateString("es-PY")}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="line-clamp-1 max-w-[200px]">{c.descripcion}</p>
                  </TableCell>
                  <TableCell className="font-medium">{fmt(c.monto)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <p className="text-sm text-emerald-600 font-medium">{fmt(c.pagado)}</p>
                    {c.pagado < c.monto && (
                      <p className="text-xs text-rose-500">Debe: {fmt(c.monto - c.pagado)}</p>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell w-32">
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{pct}%</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={estadoVariant[c.estado]}>{c.estado}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {c.estado !== "pagado" && c.estado !== "cancelado" && (
                          <DropdownMenuItem onClick={() => setPayingCompra(c)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Registrar pago
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setEditingCompra(c)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingCompra(c)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <CompraDialog
        open={!!editingCompra}
        onOpenChange={(o) => !o && setEditingCompra(null)}
        compra={editingCompra}
      />

      <RegistrarPagoCompraDialog
        open={!!payingCompra}
        onOpenChange={(o) => !o && setPayingCompra(null)}
        compra={payingCompra}
      />

      <AlertDialog open={!!deletingCompra} onOpenChange={(o) => !o && setDeletingCompra(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la compra de{" "}
              <b>{deletingCompra?.proveedor}</b> por{" "}
              <b>{deletingCompra ? fmt(deletingCompra.monto) : ""}</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loadingDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingDelete ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}