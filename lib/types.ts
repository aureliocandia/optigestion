export interface Cliente {
  id: string
  nombre: string
  apellido: string
  cedula: string | null
  telefono: string | null
  direccion: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Receta {
  id: string
  cliente_id: string
  esfera_od: number | null
  cilindro_od: number | null
  eje_od: number | null
  esfera_oi: number | null
  cilindro_oi: number | null
  eje_oi: number | null
  adicion: number | null
  dp: number | null
  observaciones: string | null
  fecha: string
  created_at: string
  cliente?: Cliente
}

export interface Venta {
  id: string
  cliente_id: string
  descripcion: string
  monto: number
  pagado: number
  estado: 'pendiente' | 'parcial' | 'pagado' | 'cancelado'
  tipo: 'contado' | 'credito'
  cuotas: number
  fecha: string
  created_at: string
  updated_at: string
  cliente?: Cliente
}

export interface Profile {
  id: string
  nombre: string
  email: string
  rol: 'administrador' | 'empleado'
  created_at: string
}

export interface DashboardStats {
  totalClientes: number
  totalVentas: number
  ventasPendientes: number
  ventasHoy: number
  ingresosMes: number
  cobranzaPendiente: number
}
