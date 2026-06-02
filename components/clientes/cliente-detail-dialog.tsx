"use client"

import { Cliente } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Mail, MapPin, Calendar, CreditCard } from "lucide-react"

interface ClienteDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: Cliente | null
}

export function ClienteDetailDialog({
  open,
  onOpenChange,
  cliente,
}: ClienteDetailDialogProps) {
  if (!cliente) return null

  const infoItems = [
    {
      icon: CreditCard,
      label: "Cedula",
      value: cliente.cedula || "No registrada",
    },
    {
      icon: Phone,
      label: "Telefono",
      value: cliente.telefono || "No registrado",
    },
    {
      icon: Mail,
      label: "Email",
      value: cliente.email || "No registrado",
    },
    {
      icon: MapPin,
      label: "Direccion",
      value: cliente.direccion || "No registrada",
    },
    {
      icon: Calendar,
      label: "Registrado",
      value: new Date(cliente.created_at).toLocaleDateString("es-PY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p>{cliente.nombre} {cliente.apellido}</p>
              <Badge variant="secondary" className="mt-1 text-xs font-normal">
                Cliente
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
