'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { OrderWithCustomer, Status } from '@/lib/types/database'

// ── Date helpers ────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0]
}
function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}
function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── Color logic ─────────────────────────────────────────────────────────────
type CardStyle = {
  border: string
  tag: string
  tagText: string
  glow: string
}

function getCardStyle(order: OrderWithCustomer): CardStyle {
  const today    = todayStr()
  const tomorrow = tomorrowStr()
  const delivery = order.delivery_date

  if (order.status === 'ready') {
    return {
      border:  'border-l-4 border-l-green-400',
      tag:     'bg-green-50 text-green-700',
      tagText: '✓ Ready',
      glow:    'hover:shadow-green-100',
    }
  }
  if (delivery < today) {
    return {
      border:  'border-l-4 border-l-red-400',
      tag:     'bg-red-50 text-red-700',
      tagText: '⚠ Overdue',
      glow:    'hover:shadow-red-100',
    }
  }
  if (delivery === tomorrow) {
    return {
      border:  'border-l-4 border-l-yellow-400',
      tag:     'bg-yellow-50 text-yellow-700',
      tagText: '⏰ Due Tomorrow',
      glow:    'hover:shadow-yellow-100',
    }
  }
  return {
    border:  'border-l-4 border-l-slate-200',
    tag:     '',
    tagText: '',
    glow:    'hover:shadow-slate-100',
  }
}

// ── Status badge ─────────────────────────────────────────────────────────────
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

// ── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ orders }: { orders: OrderWithCustomer[] }) {
  const stats = useMemo(() => {
    const received = orders.filter(o => o.status === 'received').length
    const inProg   = orders.filter(o => o.status === 'in_progress').length
    const ready    = orders.filter(o => o.status === 'ready').length
    const overdue  = orders.filter(o => o.status !== 'ready' && o.delivery_date < todayStr()).length
    return { received, inProg, ready, overdue }
  }, [orders])

  return (
    <div className="grid grid-cols-4 gap-2 mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      {[
        { label: 'Received',    count: stats.received, color: 'bg-slate-100 text-slate-700' },
        { label: 'In Progress', count: stats.inProg,   color: 'bg-blue-50 text-blue-700' },
        { label: 'Ready',       count: stats.ready,    color: 'bg-green-50 text-green-700' },
        { label: 'Overdue',     count: stats.overdue,  color: 'bg-red-50 text-red-700' },
      ].map((stat) => (
        <div key={stat.label} className={`rounded-xl p-2.5 text-center ${stat.color}`}>
          <p className="text-lg font-bold">{stat.count}</p>
          <p className="text-[10px] font-medium leading-tight">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardClient({ orders }: { orders: OrderWithCustomer[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return orders
    return orders.filter((o) => {
      const name   = o.profiles?.name?.toLowerCase()   ?? ''
      const mobile = o.profiles?.mobile?.toLowerCase() ?? ''
      return name.includes(q) || mobile.includes(q)
    })
  }, [orders, query])

  return (
    <div className="relative">
      {/* ── Page heading ── */}
      <div className="mb-4 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Orders</h1>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-200/60 to-transparent" />
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {orders.length} total · sorted by delivery date
        </p>
      </div>

      {/* ── Stats ── */}
      <StatsBar orders={orders} />

      {/* ── Search bar ── */}
      <div className="relative mb-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          id="dashboard-search"
          type="search"
          placeholder="Search by name or mobile…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-9 text-sm"
        />
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs text-slate-500 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-400" /> Ready
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-400" /> Overdue
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400" /> Due Tomorrow
        </span>
      </div>

      {/* ── Order cards ── */}
      {filtered.length === 0 ? (
        <div className="card text-center py-10 animate-fade-in-up">
          <svg className="w-16 h-16 text-slate-200 mx-auto mb-3" viewBox="0 0 80 80" fill="none">
            <rect x="10" y="30" width="50" height="30" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M10 30 L10 15 Q10 10, 15 10 L50 10 Q55 10, 55 15 L55 30" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="50" y1="30" x2="50" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="65" cy="50" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <p className="text-slate-400 text-sm">
            {query ? 'No orders match your search.' : 'No orders yet. Tap + to create one.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {filtered.map((order) => {
            const style = getCardStyle(order)
            return (
              <div
                key={order.id}
                className={`card ${style.border} flex flex-col gap-2 transition-all duration-200 hover:shadow-md ${style.glow} animate-fade-in-up`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    #{String(order.order_number).padStart(4, '0')}
                  </span>
                  <div className="flex items-center gap-2">
                    {style.tagText && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.tag}`}>
                        {style.tagText}
                      </span>
                    )}
                    <StatusBadge status={order.status as Status} />
                  </div>
                </div>

                {/* Customer info */}
                <div>
                  <p className="font-semibold text-slate-900 text-sm leading-tight">
                    {order.profiles?.name ?? '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📱 {order.profiles?.mobile ?? '—'}
                  </p>
                </div>

                {/* Delivery date + action */}
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className="text-xs text-slate-400">Delivery</p>
                    <p className="text-sm font-medium text-slate-700">
                      {formatDate(order.delivery_date)}
                    </p>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all hover:shadow-md hover:shadow-slate-900/20"
                  >
                    View Order →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Floating + button ── */}
      <Link
        id="new-order-fab"
        href="/admin/orders/new"
        className="fixed bottom-6 right-4 w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-full shadow-lg shadow-amber-500/30 flex items-center justify-center text-2xl font-light active:scale-95 transition-all z-50 hover:shadow-xl hover:shadow-amber-500/40 animate-pulse-gold"
        aria-label="Create new order"
      >
        +
      </Link>
    </div>
  )
}
