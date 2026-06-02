"use client"

import { useState } from "react"
import { Venta } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, DollarSign, Eye, CreditCard } from "lucide-react"
import { VentaDetailDialog } from "./venta-detail-dialog"
import { DeleteVentaDialog } from "./delete-venta-dialog"
import { RegistrarPagoDialog } from "./registrar-pago-dialog"

interface VentasTableProps {
  ventas: (Venta & { cliente: { id: string; nombre: string; apellido: string } | null })[]
}

const estadoBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pagado: "default",
  parcial: "secondary",
  pendiente: "outline",
  cancelado: "destructive",
}

export function VentasTable({ ventas }: VentasTableProps) {
  const [viewingVenta, setViewingVenta] = useState<typeof ventas[0] | null>(null)
  const [deletingVenta, setDeletingVenta] = useState<typeof ventas[0] | null>(null)
  const [payingVenta, setPayingVenta] = useState<typeof ventas[0] | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (ventas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <CreditCard className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No hay ventas</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza registrando tu primera venta
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Descripcion</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead className="hidden sm:table-cell">Pagado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventas.map((venta) => (
              <TableRow key={venta.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {venta.cliente
                        ? `${venta.cliente.nombre} ${venta.cliente.apellido}`
                        : "Cliente desconocido"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(venta.fecha).toLocaleDateString("es-PY")}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className="line-clamp-1 max-w-[200px]">{venta.descripcion}</p>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(venta.monto)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatCurrency(venta.pagado)}
                </TableCell>
                <TableCell>
                  <Badge variant={estadoBadgeVariant[venta.estado]}>
                    {venta.estado}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => setViewingVenta(venta)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalle
                      </DropdownMenuItem>
                      {venta.estado !== "pagado" && venta.estado !== "cancelado" && (
                        <DropdownMenuItem onClick={() => setPayingVenta(venta)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Registrar pago
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setDeletingVenta(venta)}
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

      <VentaDetailDialog
        open={!!viewingVenta}
        onOpenChange={(open) => !open && setViewingVenta(null)}
        venta={viewingVenta}
      />

      <DeleteVentaDialog
        open={!!deletingVenta}
        onOpenChange={(open) => !open && setDeletingVenta(null)}
        venta={deletingVenta}
      />

      <RegistrarPagoDialog
        open={!!payingVenta}
        onOpenChange={(open) => !open && setPayingVenta(null)}
        venta={payingVenta}
      />
    </>
  )
}
