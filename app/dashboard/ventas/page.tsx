import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { VentasTable } from "@/components/ventas/ventas-table"
import { VentasHeader } from "@/components/ventas/ventas-header"
import { Skeleton } from "@/components/ui/skeleton"

interface VentasPageProps {
  searchParams: Promise<{ search?: string; estado?: string }>
}

export default async function VentasPage({ searchParams }: VentasPageProps) {
  const params = await searchParams
  const search = params.search || ""
  const estado = params.estado || ""

  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre, apellido")
    .order("nombre")

  return (
    <div className="space-y-6">
      <VentasHeader clientes={clientes || []} />
      <Suspense fallback={<TableSkeleton />}>
        <VentasContent search={search} estado={estado} />
      </Suspense>
    </div>
  )
}

async function VentasContent({ search, estado }: { search: string; estado: string }) {
  const supabase = await createClient()
  
  let query = supabase
    .from("ventas")
    .select("*, cliente:clientes(id, nombre, apellido)")
    .order("fecha", { ascending: false })

  if (estado) {
    query = query.eq("estado", estado)
  }

  const { data: ventas, error } = await query

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Error al cargar ventas: {error.message}</p>
      </div>
    )
  }

  // Filter by search if provided
  let filteredVentas = ventas || []
  if (search) {
    const searchLower = search.toLowerCase()
    filteredVentas = filteredVentas.filter((v) => {
      const cliente = v.cliente as { nombre: string; apellido: string } | null
      if (cliente) {
        return (
          cliente.nombre.toLowerCase().includes(searchLower) ||
          cliente.apellido.toLowerCase().includes(searchLower) ||
          v.descripcion.toLowerCase().includes(searchLower)
        )
      }
      return v.descripcion.toLowerCase().includes(searchLower)
    })
  }

  return <VentasTable ventas={filteredVentas} />
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
