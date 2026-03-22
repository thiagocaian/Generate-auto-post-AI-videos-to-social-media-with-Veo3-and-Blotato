import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for Warehouse system
export type WarehouseItem = {
  id: string
  sku: string
  name: string
  description?: string
  category: string
  unit: string
  current_stock: number
  minimum_stock: number
  unit_cost: number
  supplier_id?: string
  location?: string
  qr_code: string
  image_url?: string
  created_at: string
  updated_at: string
}

export type Supplier = {
  id: string
  name: string
  email: string
  phone?: string
  telegram_id?: string
  category?: string
}

export type WarehouseTransaction = {
  id: string
  item_id: string
  project_id?: string
  transaction_type: 'entry' | 'exit'
  quantity: number
  unit_cost: number
  total_cost: number
  notes?: string
  performed_by?: string
  created_at: string
  warehouse_items?: WarehouseItem
  projects?: Project
}

export type Project = {
  id: string
  name: string
  client: string
  budget?: number
  status: 'active' | 'completed' | 'on_hold'
  created_at: string
}
