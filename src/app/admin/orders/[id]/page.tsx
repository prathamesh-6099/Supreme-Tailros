import { notFound }       from 'next/navigation'
import { createClient }   from '@/lib/supabase/server'
import OrderDetailClient  from './OrderDetailClient'
import type { Measurement, OrderWithCustomer } from '@/lib/types/database'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps) {
  return { title: `Order #${params.id.slice(0, 6).toUpperCase()} — Supreme Tailors` }
}

export default async function OrderDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch order + customer profile in one query
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles ( id, name, mobile )
    `)
    .eq('id', params.id)
    .single()

  if (error || !order) notFound()

  // Fetch measurements
  const { data: measurements } = await supabase
    .from('measurements')
    .select('*')
    .eq('order_id', params.id)

  const shirt = (measurements ?? []).find((m) => m.type === 'shirt') as Measurement | undefined
  const pant  = (measurements ?? []).find((m) => m.type === 'pant')  as Measurement | undefined

  // Fetch latest SMS log for this order
  const { data: smsLogs } = await supabase
    .from('sms_logs')
    .select('status, sent_at')
    .eq('order_id', params.id)
    .order('sent_at', { ascending: false })
    .limit(1)

  const lastSms = smsLogs?.[0] ?? null

  return (
    <OrderDetailClient
      order={order as OrderWithCustomer & { profiles: { name: string; mobile: string } }}
      shirt={shirt}
      pant={pant}
      lastSms={lastSms}
    />
  )
}
