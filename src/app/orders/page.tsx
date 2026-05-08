import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Status } from '@/lib/types/database'

export const metadata = {
  title: 'My Orders — Supreme Tailors',
}

const STATUS_LABEL: Record<Status, string> = {
  received:    'Received',
  in_progress: 'In Progress',
  ready:       'Ready',
}
const STATUS_CLASS: Record<Status, string> = {
  received:    'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  ready:       'bg-green-100 text-green-700',
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function CustomerOrdersPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch orders:', error)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-slate-500 text-sm">You don&apos;t have any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-medium text-slate-900">
                  #{String(order.order_number).padStart(4, '0')}
                </span>
                <StatusBadge status={order.status as Status} />
              </div>

              <div>
                <p className="text-xs text-slate-400">Expected Delivery</p>
                <p className="text-sm font-semibold text-slate-700">
                  {formatDate(order.delivery_date)}
                </p>
              </div>

              <Link
                href={`/orders/${order.id}`}
                className="btn-secondary text-center text-sm py-2"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
