"use client"

import { useState } from "react"
import { Receta } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, FileText, Eye, Printer } from "lucide-react"
import { RecetaDetailDialog } from "./receta-detail-dialog"
import { DeleteRecetaDialog } from "./delete-receta-dialog"

interface RecetasTableProps {
  recetas: (Receta & { cliente: { id: string; nombre: string; apellido: string } | null })[]
}

export function RecetasTable({ recetas }: RecetasTableProps) {
  const [viewingReceta, setViewingReceta] = useState<typeof recetas[0] | null>(null)
  const [deletingReceta, setDeletingReceta] = useState<typeof recetas[0] | null>(null)

  if (recetas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No hay recetas</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza agregando la primera receta
        </p>
      </div>
    )
  }

  const formatValue = (value: number | null) => {
    if (value === null) return "-"
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="hidden md:table-cell">OD (Esf/Cil/Eje)</TableHead>
              <TableHead className="hidden md:table-cell">OI (Esf/Cil/Eje)</TableHead>
              <TableHead className="hidden lg:table-cell">Add</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recetas.map((receta) => (
              <TableRow key={receta.id}>
                <TableCell>
                  <p className="font-medium">
                    {receta.cliente
                      ? `${receta.cliente.nombre} ${receta.cliente.apellido}`
                      : "Cliente desconocido"}
                  </p>
                </TableCell>
                <TableCell>
                  {new Date(receta.fecha).toLocaleDateString("es-PY")}
                </TableCell>
                <TableCell className="hidden md:table-cell font-mono text-sm">
                  {formatValue(receta.esfera_od)} / {formatValue(receta.cilindro_od)} / {receta.eje_od ?? "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell font-mono text-sm">
                  {formatValue(receta.esfera_oi)} / {formatValue(receta.cilindro_oi)} / {receta.eje_oi ?? "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell font-mono text-sm">
                  {receta.adicion ? `+${receta.adicion.toFixed(2)}` : "-"}
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
                      <DropdownMenuItem onClick={() => setViewingReceta(receta)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingReceta(receta)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RecetaDetailDialog
        open={!!viewingReceta}
        onOpenChange={(open) => !open && setViewingReceta(null)}
        receta={viewingReceta}
      />

      <DeleteRecetaDialog
        open={!!deletingReceta}
        onOpenChange={(open) => !open && setDeletingReceta(null)}
        receta={deletingReceta}
      />
    </>
  )
}
