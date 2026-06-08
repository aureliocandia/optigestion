
"use client"

import { useState } from "react"
import { Cliente } from "@/lib/types"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, FileText, Eye } from "lucide-react"
import { ClienteDialog } from "./cliente-dialog"
import { DeleteClienteDialog } from "./delete-cliente-dialog"
import { ClienteDetailDialog } from "./cliente-detail-dialog"

interface ClientesTableProps {
  clientes: Cliente[]
}

// Genera código igual que en cliente-dialog
function getCodigo(cliente: Cliente): string {
  if (cliente.cedula) {
    const nums = cliente.cedula.replace(/\D/g, "")
    if (nums.length >= 3) return `#${nums.slice(-3)}`
  }
  return `#${(cliente.apellido || "XXX").slice(0, 3).toUpperCase().padEnd(3, "X")}`
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null)
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null)

  if (clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No hay clientes</h3>
        <p className="mt-2 text-sm text-muted-foreground">Comienza agregando tu primer cliente</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Cédula</TableHead>
              <TableHead className="hidden md:table-cell">Teléfono</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => {
              const codigo = getCodigo(cliente)
              return (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono font-semibold text-primary">
                      {codigo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{cliente.nombre} {cliente.apellido}</p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {cliente.telefono || "Sin teléfono"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {cliente.cedula || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {cliente.telefono || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    {cliente.email || "—"}
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
                        <DropdownMenuItem onClick={() => setViewingCliente(cliente)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingCliente(cliente)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingCliente(cliente)}
                          className="text-destructive"
                        >
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

      <ClienteDialog
        open={!!editingCliente}
        onOpenChange={(open) => !open && setEditingCliente(null)}
        cliente={editingCliente}
      />
      <DeleteClienteDialog
        open={!!deletingCliente}
        onOpenChange={(open) => !open && setDeletingCliente(null)}
        cliente={deletingCliente}
      />
      <ClienteDetailDialog
        open={!!viewingCliente}
        onOpenChange={(open) => !open && setViewingCliente(null)}
        cliente={viewingCliente}
      />
    </>
  )
}