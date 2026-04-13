import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client with session persistence (for 'use client' pages)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side only client (no session)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserCompany() {
  const user = await getUser()
  if (!user) return null

  const { data } = await supabase
    .from('company_members')
    .select('role, companies(id, name, slug, plan, plan_status, primary_color)')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function signOut() {
  await supabase.auth.signOut()
  window.location.href = '/login'
}

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
  company_id?: string
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

export type Company = {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'pro' | 'enterprise'
  plan_status: 'active' | 'trial' | 'suspended'
  primary_color: string
  trial_ends_at?: string
  created_at: string
}

export type CompanyMember = {
  id: string
  company_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

// Types for Job Management system
export type JobStatus = 'enquiry' | 'quoted' | 'scheduled' | 'in_progress' | 'completed' | 'invoiced' | 'paid'

export type Job = {
  id: string
  company_id: string
  user_id?: string
  job_number: string
  title: string
  description?: string
  client_name?: string
  client_email?: string
  client_phone?: string
  site_address?: string
  status: JobStatus
  priority: 'high' | 'medium' | 'low'
  assigned_to?: string
  quote_id?: string
  scheduled_date?: string
  scheduled_time_start?: string
  scheduled_time_end?: string
  estimated_hours?: number
  actual_hours?: number
  notes?: string
  tags?: string[]
  total_value?: number
  photos_before?: string[]
  photos_after?: string[]
  checklist?: Array<{ task: string; done: boolean }>
  materials?: Array<{ item: string; qty: number; unit: string }>
  documents?: Array<{ name: string; url: string }>
  admin_notes?: string
  instructions?: string
  client_signature_url?: string
  signature_type?: 'approval' | 'completion'
  signed_at?: string
  signer_name?: string
  created_at: string
  updated_at: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'void'

export type Invoice = {
  id: string
  company_id: string
  user_id?: string
  invoice_number: string
  job_id?: string
  quote_id?: string
  client_name: string
  client_email?: string
  client_address?: string
  items: Array<{
    description: string
    qty: number
    unit: string
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  amount_paid: number
  status: InvoiceStatus
  payment_method?: string
  payment_date?: string
  due_date?: string
  notes?: string
  issued_at?: string
  created_at: string
  updated_at: string
}
