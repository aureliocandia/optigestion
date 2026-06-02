"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Cliente } from "@/lib/types"
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
import { MoreHorizontal, Pencil, Trash2, FileText, Eye } from "lucide-react"
import { ClienteDialog } from "./cliente-dialog"
import { DeleteClienteDialog } from "./delete-cliente-dialog"
import { ClienteDetailDialog } from "./cliente-detail-dialog"

interface ClientesTableProps {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null)
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null)
  const router = useRouter()

  if (clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No hay clientes</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comienza agregando tu primer cliente
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
              <TableHead>Nombre</TableHead>
              <TableHead>Cedula</TableHead>
              <TableHead className="hidden md:table-cell">Telefono</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{cliente.nombre} {cliente.apellido}</p>
                    <p className="text-sm text-muted-foreground md:hidden">
                      {cliente.telefono || "Sin telefono"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{cliente.cedula || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {cliente.telefono || "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {cliente.email || "-"}
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
            ))}
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
