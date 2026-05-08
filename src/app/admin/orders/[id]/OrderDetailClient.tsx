'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  updateStatusAction,
  updateOrderDetailsAction,
} from '@/app/actions/orderActions'
import type { Status, Measurement, OrderWithCustomer } from '@/lib/types/database'

// ── Constants ─────────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ type, message }: { type: 'success' | 'error' | 'info'; message: string }) {
  const colors = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
  }
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)]
      max-w-md px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium
      flex items-center gap-2 ${colors[type]}`}
    >
      {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} {message}
    </div>
  )
}

// ── Status Stepper ────────────────────────────────────────────────────────────
function StatusStepper({
  current,
  onAdvance,
  isPending,
}: {
  current:   Status
  onAdvance: (s: Status) => void
  isPending: boolean
}) {
  const currentIdx = STEPS.findIndex((s) => s.status === current)
  const nextStep   = currentIdx < STEPS.length - 1 ? STEPS[currentIdx + 1] : null

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
        Order Status
      </h2>

      <div className="relative flex items-start justify-between">
        {/* Connector lines */}
        <div className="absolute top-4 left-0 right-0 flex px-6 pointer-events-none">
          {STEPS.slice(0, -1).map((_, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className={`h-0.5 flex-1 mx-1 rounded transition-colors ${
                current === 'ready' || i < currentIdx ? 'bg-slate-900' : 'bg-slate-200'
              }`} />
            </div>
          ))}
        </div>

        {STEPS.map((step, idx) => {
          // If the order is 'ready' (final state), all steps are "done"
          const isDone    = current === 'ready' ? true : idx < currentIdx
          const isCurrent = current !== 'ready' && idx === currentIdx
          const isNext    = idx === currentIdx + 1
          const canClick  = isNext && !isPending

          return (
            <div key={step.status} className="flex flex-col items-center gap-1.5 flex-1">
              <button
                onClick={() => canClick && onAdvance(step.status)}
                disabled={!canClick || isPending}
                title={isNext ? `Advance to "${step.label}"` : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10
                  text-xs font-bold transition-all duration-200 relative
                  ${isDone    ? 'bg-slate-900 text-white'                           : ''}
                  ${isCurrent ? 'bg-slate-900 text-white ring-4 ring-slate-200'     : ''}
                  ${isNext    ? 'bg-white border-2 border-slate-400 text-slate-500 hover:border-slate-900 hover:text-slate-900 cursor-pointer' : ''}
                  ${idx > currentIdx + 1 ? 'bg-white border-2 border-slate-200 text-slate-300 cursor-not-allowed' : ''}
                  ${isPending && isNext ? 'animate-pulse' : ''}
                `}
              >
                {isDone ? '✓' : idx + 1}
              </button>

              <span className={`text-center leading-tight text-xs font-medium
                ${isCurrent ? 'text-slate-900' : isDone ? 'text-slate-600' : 'text-slate-400'}`}
              >
                {step.short}
              </span>
            </div>
          )
        })}
      </div>

      {nextStep && (
        <button
          onClick={() => onAdvance(nextStep.status)}
          disabled={isPending}
          className="btn-primary w-full mt-6"
        >
          {isPending ? 'Updating Status...' : `Mark as ${nextStep.short}`}
        </button>
      )}

      {current === 'ready' && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-700 font-medium">
          ✓ Order is ready — SMS has been sent to customer.
        </div>
      )}
    </div>
  )
}

// ── Measurements Table ────────────────────────────────────────────────────────
function MeasurementsSection({
  shirt,
  pant,
}: {
  shirt: Measurement | undefined
  pant:  Measurement | undefined
}) {
  const shirtData = shirt?.data as Record<string, string> | undefined
  const pantData  = pant?.data  as Record<string, string> | undefined
  const unit      = shirtData?.unit ?? pantData?.unit ?? ''

  if (!shirt && !pant) {
    return (
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Measurements
        </h2>
        <p className="text-sm text-slate-400 text-center py-4">
          No measurements recorded.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Measurements
        </h2>
        {unit && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* Two-column table */}
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
            {/* Shared fields first (both have 'waist') */}
            {Array.from(new Set([...SHIRT_FIELDS.map(f => f.key), ...PANT_FIELDS.map(f => f.key)])).map((key) => {
              const shirtField = SHIRT_FIELDS.find(f => f.key === key)
              const pantField  = PANT_FIELDS.find(f => f.key === key)
              const label      = shirtField?.label ?? pantField?.label ?? key
              const shirtVal   = shirtField ? getMeasValue(shirtData, key) : '—'
              const pantVal    = pantField  ? getMeasValue(pantData,  key) : '—'

              // Skip row if both are '—' and neither measurement type exists
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
    </div>
  )
}

// ── Edit Panel ────────────────────────────────────────────────────────────────
function EditPanel({
  orderId,
  deliveryDate,
  notes,
  onCancel,
  onSaved,
}: {
  orderId:      string
  deliveryDate: string
  notes:        string | null
  onCancel:     () => void
  onSaved:      () => void
}) {
  const [date,    setDate]    = useState(deliveryDate)
  const [noteVal, setNoteVal] = useState(notes ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function save() {
    startTransition(async () => {
      const result = await updateOrderDetailsAction(orderId, date, noteVal)
      if (result.success) {
        onSaved()
      } else {
        setError(result.error ?? 'Failed to save')
      }
    })
  }

  return (
    <div className="card border-amber-200 bg-amber-50 space-y-3">
      <h2 className="text-sm font-semibold text-amber-800">Edit Order</h2>

      <div>
        <label className="label text-slate-700">Delivery Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input bg-white"
        />
      </div>

      <div>
        <label className="label text-slate-700">Notes</label>
        <textarea
          value={noteVal}
          onChange={(e) => setNoteVal(e.target.value)}
          rows={3}
          className="input resize-none bg-white"
          placeholder="Additional notes…"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary flex-1 py-2">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={isPending}
          className="btn-primary flex-1 py-2"
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  order:   OrderWithCustomer & { profiles: { name: string; mobile: string } }
  shirt:   Measurement | undefined
  pant:    Measurement | undefined
  lastSms: { status: string; sent_at: string } | null
}

export default function OrderDetailClient({ order, shirt, pant, lastSms }: Props) {
  const [status,    setStatus]    = useState<Status>(order.status as Status)
  const [editMode,  setEditMode]  = useState(false)
  const [toast,     setToast]     = useState<{ type: 'success'|'error'|'info'; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Delivery date and notes can change in edit mode
  const [deliveryDate, setDeliveryDate] = useState(order.delivery_date)
  const [notes,        setNotes]        = useState(order.notes)

  function showToast(type: 'success'|'error'|'info', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  function handleAdvance(newStatus: Status) {
    startTransition(async () => {
      const result = await updateStatusAction(order.id, newStatus)
      if (result.success) {
        setStatus(newStatus)
        if (newStatus === 'ready') {
          showToast('success', 'Status updated to Ready! SMS sent to customer.')
        } else {
          showToast('success', `Status updated to "${newStatus.replace('_', ' ')}".`)
        }
      } else {
        showToast('error', result.error ?? 'Failed to update status')
      }
    })
  }

  function handleSaved() {
    setEditMode(false)
    showToast('success', 'Order details updated.')
  }

  const statusClass: Record<Status, string> = {
    received:    'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    ready:       'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-4 pb-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* ── Back nav ── */}
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-1 text-sm text-slate-500 active:scale-95 transition-transform"
      >
        ← Dashboard
      </Link>

      {/* ── Order header ── */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono mb-1">
              Order #{String(order.order_number).padStart(4, '0')}
            </p>
            <h1 className="text-xl font-bold text-slate-900">{order.profiles?.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">📱 {order.profiles?.mobile}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass[status]}`}>
            {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400">Delivery Date</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {formatDate(deliveryDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Created</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {formatDate(order.created_at.split('T')[0])}
            </p>
          </div>
          {notes && (
            <div className="col-span-2">
              <p className="text-xs text-slate-400">Notes</p>
              <p className="text-sm text-slate-700 mt-0.5">{notes}</p>
            </div>
          )}
        </div>

        {/* Edit button — only show if not ready */}
        {status !== 'ready' && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="mt-3 text-xs font-medium text-slate-500 border border-slate-200
              px-3 py-1.5 rounded-lg hover:border-slate-400 active:scale-95 transition-transform"
          >
            ✏ Edit Details
          </button>
        )}
      </div>

      {/* ── Edit panel ── */}
      {editMode && (
        <EditPanel
          orderId={order.id}
          deliveryDate={deliveryDate}
          notes={notes}
          onCancel={() => setEditMode(false)}
          onSaved={() => {
            handleSaved()
            // Optimistically update local state
            setDeliveryDate(deliveryDate)
            setNotes(notes)
          }}
        />
      )}

      {/* ── Status stepper ── */}
      <StatusStepper
        current={status}
        onAdvance={handleAdvance}
        isPending={isPending}
      />

      {/* ── SMS log ── */}
      {lastSms && (
        <div className={`card text-xs flex items-center gap-2
          ${lastSms.status === 'sent'
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-red-200 bg-red-50 text-red-700'}`}
        >
          {lastSms.status === 'sent' ? '📱 SMS sent' : '⚠ SMS failed'} on{' '}
          {new Date(lastSms.sent_at).toLocaleString('en-IN')}
        </div>
      )}

      {/* ── Measurements ── */}
      <MeasurementsSection shirt={shirt} pant={pant} />
    </div>
  )
}
