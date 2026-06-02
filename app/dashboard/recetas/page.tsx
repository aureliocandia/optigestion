import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { RecetasTable } from "@/components/recetas/recetas-table"
import { RecetasHeader } from "@/components/recetas/recetas-header"
import { Skeleton } from "@/components/ui/skeleton"

interface RecetasPageProps {
  searchParams: Promise<{ search?: string; cliente?: string }>
}

export default async function RecetasPage({ searchParams }: RecetasPageProps) {
  const params = await searchParams
  const search = params.search || ""
  const clienteId = params.cliente || ""

  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre, apellido")
    .order("nombre")

  return (
    <div className="space-y-6">
      <RecetasHeader clientes={clientes || []} />
      <Suspense fallback={<TableSkeleton />}>
        <RecetasContent search={search} clienteId={clienteId} />
      </Suspense>
    </div>
  )
}

async function RecetasContent({ search, clienteId }: { search: string; clienteId: string }) {
  const supabase = await createClient()
  
  let query = supabase
    .from("recetas")
    .select("*, cliente:clientes(id, nombre, apellido)")
    .order("fecha", { ascending: false })

  if (clienteId) {
    query = query.eq("cliente_id", clienteId)
  }

  const { data: recetas, error } = await query

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Error al cargar recetas: {error.message}</p>
      </div>
    )
  }

  // Filter by search if provided
  let filteredRecetas = recetas || []
  if (search) {
    const searchLower = search.toLowerCase()
    filteredRecetas = filteredRecetas.filter((r) => {
      const cliente = r.cliente as { nombre: string; apellido: string } | null
      if (cliente) {
        return (
          cliente.nombre.toLowerCase().includes(searchLower) ||
          cliente.apellido.toLowerCase().includes(searchLower)
        )
      }
      return false
    })
  }

  return <RecetasTable recetas={filteredRecetas} />
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
