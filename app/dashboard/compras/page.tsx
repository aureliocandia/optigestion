import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ComprasHeader } from "@/components/compras/compras-header"
import { ComprasTable } from "@/components/compras/compras-table"
import { Skeleton } from "@/components/ui/skeleton"

interface ComprasPageProps {
  searchParams: Promise<{ search?: string; estado?: string }>
}

export default async function ComprasPage({ searchParams }: ComprasPageProps) {
  const params = await searchParams
  const search = params.search || ""
  const estado = params.estado || ""

  return (
    <div className="space-y-6">
      <ComprasHeader />
      <Suspense fallback={<TableSkeleton />}>
        <ComprasContent search={search} estado={estado} />
      </Suspense>
    </div>
  )
}

async function ComprasContent({ search, estado }: { search: string; estado: string }) {
  const supabase = await createClient()

  let query = supabase
    .from("compras")
    .select("*")
    .order("fecha", { ascending: false })

  if (estado) query = query.eq("estado", estado)

  const { data: compras, error } = await query

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Error al cargar compras: {error.message}</p>
      </div>
    )
  }

  let filtered = compras || []
  if (search) {
    const s = search.toLowerCase()
filtered = filtered.filter(
  (c) =>
    c.proveedor.toLowerCase().includes(s) ||
    c.descripcion.toLowerCase().includes(s) ||
    (c.numero_factura || "").toLowerCase().includes(s)
)
  }

  return <ComprasTable compras={filtered} />
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
