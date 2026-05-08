import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Measurement, Status } from '@/lib/types/database'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Order #${params.id.slice(0, 6).toUpperCase()} — Supreme Tailors` }
}

const STEPS: { status: Status; label: string; short: string }[] = [
  { status: 'received',    label: 'Order Received',    short: 'Received'   },
  { status: 'in_progress', label: 'In Progress',       short: 'In Progress'},
  { status: 'ready',       label: 'Ready for Pickup',  short: 'Ready'      },
]

const SHIRT_FIELDS = [
  { key: 'neck',          label: 'Neck'          },
  { key: 'chest',         label: 'Chest'         },
  { key: 'waist',         label: 'Waist'         },
  { key: 'shoulder',      label: 'Shoulder'      },
  { key: 'sleeve_length', label: 'Sleeve Length' },
  { key: 'shirt_length',  label: 'Shirt Length'  },
]

const PANT_FIELDS = [
  { key: 'waist',       label: 'Waist'       },
  { key: 'seat',        label: 'Seat'        },
  { key: 'thigh',       label: 'Thigh'       },
  { key: 'knee',        label: 'Knee'        },
  { key: 'bottom',      label: 'Bottom'      },
  { key: 'inseam',      label: 'Inseam'      },
  { key: 'pant_length', label: 'Pant Length' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getMeasValue(data: Record<string, string> | undefined, key: string): string {
  if (!data) return '—'
  const val = data[key]
  return val && val.trim() !== '' ? `${val} ${data.unit ?? ''}`.trim() : '—'
}

export default async function CustomerOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch order
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
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

  const shirtData = shirt?.data as Record<string, string> | undefined
  const pantData  = pant?.data  as Record<string, string> | undefined
  const unit      = shirtData?.unit ?? pantData?.unit ?? ''

  const currentIdx = STEPS.findIndex((s) => s.status === order.status)

  return (
    <div className="space-y-6 pb-6">
      {/* ── Back nav ── */}
      <Link
        href="/orders"
        className="flex items-center gap-1 text-sm text-slate-500 active:scale-95 transition-transform"
      >
        ← My Orders
      </Link>

      {/* ── Order header ── */}
      <div className="card">
        <p className="text-xs text-slate-400 font-mono mb-1">
          Order #{String(order.order_number).padStart(4, '0')}
        </p>
        <h1 className="text-xl font-bold text-slate-900 mb-4">Order Details</h1>

        <div>
          <p className="text-xs text-slate-400">Expected Delivery</p>
          <p className="text-base font-semibold text-slate-800">
            {formatDate(order.delivery_date)}
          </p>
        </div>
      </div>

      {/* ── Status stepper ── */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
          Status Tracker
        </h2>

        <div className="relative flex items-start justify-between">
          <div className="absolute top-4 left-0 right-0 flex px-6 pointer-events-none">
            {STEPS.slice(0, -1).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className={`h-0.5 flex-1 mx-1 rounded ${
                  i < currentIdx ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              </div>
            ))}
          </div>

          {STEPS.map((step, idx) => {
            const isDone    = order.status === 'ready' ? true : idx < currentIdx
            const isCurrent = order.status !== 'ready' && idx === currentIdx

            return (
              <div key={step.status} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10
                    text-xs font-bold relative
                    ${isDone ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}
                    ${isCurrent ? 'ring-4 ring-green-100 bg-green-500 text-white' : ''}
                  `}
                >
                  {isDone ? '✓' : idx + 1}
                </div>

                <span className={`text-center leading-tight text-xs font-medium
                  ${isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}
                >
                  {step.short}
                </span>
              </div>
            )
          })}
        </div>
        
        {order.status === 'ready' && (
          <div className="mt-6 text-center text-sm font-medium text-green-700 bg-green-50 rounded-lg py-2">
            Your clothes are ready for pickup!
          </div>
        )}
      </div>

      {/* ── Measurements ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            My Measurements
          </h2>
          {unit && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {unit}
            </span>
          )}
        </div>

        {(!shirt && !pant) ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No measurements recorded.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[280px]">
              <thead>
                <tr>
                  <th className="text-left text-xs text-slate-500 font-semibold pb-2 w-[30%]">
                    Field
                  </th>
                  <th className="text-left text-xs text-slate-500 font-semibold pb-2 w-[35%]">
                    👔 Shirt
                  </th>
                  <th className="text-left text-xs text-slate-500 font-semibold pb-2 w-[35%]">
                    👖 Pant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Array.from(new Set([...SHIRT_FIELDS.map(f => f.key), ...PANT_FIELDS.map(f => f.key)])).map((key) => {
                  const shirtField = SHIRT_FIELDS.find(f => f.key === key)
                  const pantField  = PANT_FIELDS.find(f => f.key === key)
                  const label      = shirtField?.label ?? pantField?.label ?? key
                  const shirtVal   = shirtField ? getMeasValue(shirtData, key) : '—'
                  const pantVal    = pantField  ? getMeasValue(pantData,  key) : '—'

                  if (shirtVal === '—' && pantVal === '—' && !shirt && !pant) return null

                  return (
                    <tr key={key}>
                      <td className="py-2 text-slate-500 text-xs">{label}</td>
                      <td className={`py-2 font-medium text-xs ${shirtVal === '—' ? 'text-slate-300' : 'text-slate-800'}`}>
                        {shirtVal}
                      </td>
                      <td className={`py-2 font-medium text-xs ${pantVal === '—' ? 'text-slate-300' : 'text-slate-800'}`}>
                        {pantVal}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Footer note ── */}
      <div className="text-center text-sm text-slate-500 mt-8 mb-4">
        <p>For queries call: <span className="font-medium text-slate-700">0123456789</span></p>
        <p className="text-xs mt-1">Supreme Tailors</p>
      </div>
    </div>
  )
}
