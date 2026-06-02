import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ClientesTable } from "@/components/clientes/clientes-table"
import { ClientesHeader } from "@/components/clientes/clientes-header"
import { Skeleton } from "@/components/ui/skeleton"

interface ClientesPageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const params = await searchParams
  const search = params.search || ""

  return (
    <div className="space-y-6">
      <ClientesHeader />
      <Suspense fallback={<TableSkeleton />}>
        <ClientesContent search={search} />
      </Suspense>
    </div>
  )
}

async function ClientesContent({ search }: { search: string }) {
  const supabase = await createClient()
  
  let query = supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,cedula.ilike.%${search}%`)
  }

  const { data: clientes, error } = await query

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Error al cargar clientes: {error.message}</p>
      </div>
    )
  }

  return <ClientesTable clientes={clientes || []} />
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
