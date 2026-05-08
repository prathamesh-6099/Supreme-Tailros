import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import type { OrderWithCustomer } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — Supreme Tailors',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles ( name, mobile )
    `)
    .order('delivery_date', { ascending: true })

  if (error) {
    console.error('Dashboard fetch error:', error)
  }

  return <DashboardClient orders={(orders as OrderWithCustomer[]) ?? []} />
}
