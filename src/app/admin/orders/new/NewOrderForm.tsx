'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOrderAction, type MeasurementData } from '@/app/actions/createOrder'

// ── Field definitions ────────────────────────────────────────────────────────
const SHIRT_FIELDS = [
  { key: 'neck',          label: 'Neck' },
  { key: 'chest',         label: 'Chest' },
  { key: 'waist',         label: 'Waist' },
  { key: 'shoulder',      label: 'Shoulder' },
  { key: 'sleeve_length', label: 'Sleeve Length' },
  { key: 'shirt_length',  label: 'Shirt Length' },
]

const PANT_FIELDS = [
  { key: 'waist',       label: 'Waist' },
  { key: 'seat',        label: 'Seat' },
  { key: 'thigh',       label: 'Thigh' },
  { key: 'knee',        label: 'Knee' },
  { key: 'bottom',      label: 'Bottom' },
  { key: 'inseam',      label: 'Inseam' },
  { key: 'pant_length', label: 'Pant Length' },
]

type Unit = 'cm' | 'inches'
type MeasTab = 'shirt' | 'pant'

function emptyMeasurements(fields: { key: string }[]) {
  return Object.fromEntries(fields.map((f) => [f.key, '']))
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md
        px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2
        ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
    >
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  )
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {([1, 2] as const).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${current >= step
                ? 'bg-slate-900 text-white'
                : 'bg-slate-200 text-slate-500'}`}
          >
            {step}
          </div>
          <span className={`text-xs ${current >= step ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
            {step === 1 ? 'Customer Info' : 'Measurements'}
          </span>
          {step < 2 && <div className="w-6 h-px bg-slate-300" />}
        </div>
      ))}
    </div>
  )
}

// ── Main form component ───────────────────────────────────────────────────────
export default function NewOrderForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Step
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 fields
  const [name,         setName]         = useState('')
  const [mobile,       setMobile]       = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes,        setNotes]        = useState('')

  // Step 1 errors
  const [step1Errors, setStep1Errors] = useState<Partial<Record<string, string>>>({})

  // Step 2 fields
  const [unit,    setUnit]    = useState<Unit>('cm')
  const [measTab, setMeasTab] = useState<MeasTab>('shirt')
  const [shirt,   setShirt]   = useState<MeasurementData>(emptyMeasurements(SHIRT_FIELDS))
  const [pant,    setPant]    = useState<MeasurementData>(emptyMeasurements(PANT_FIELDS))

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // ── Step 1 validation ────────────────────────────────────────────────────
  function validateStep1() {
    const errors: Record<string, string> = {}
    if (!name.trim())         errors.name         = 'Name is required'
    if (!mobile.trim())       errors.mobile       = 'Mobile number is required'
    else if (!/^\d{10}$/.test(mobile.trim())) errors.mobile = 'Enter a valid 10-digit mobile number'
    if (!deliveryDate)        errors.deliveryDate = 'Delivery date is required'
    setStep1Errors(errors)
    return Object.keys(errors).length === 0
  }

  function handleNext() {
    if (validateStep1()) setStep(2)
  }

  // ── Measurement field update ─────────────────────────────────────────────
  function updateShirt(key: string, value: string) {
    setShirt((prev) => ({ ...prev, [key]: value }))
  }
  function updatePant(key: string, value: string) {
    setPant((prev) => ({ ...prev, [key]: value }))
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  function handleSubmit() {
    const shirtData = { ...shirt, unit }
    const pantData  = { ...pant,  unit }

    const hasShirt = SHIRT_FIELDS.some((f) => shirt[f.key].trim() !== '')
    const hasPant  = PANT_FIELDS.some((f)  => pant[f.key].trim()  !== '')

    startTransition(async () => {
      const result = await createOrderAction({
        name,
        mobile,
        deliveryDate,
        notes,
        shirt: hasShirt ? shirtData : undefined,
        pant:  hasPant  ? pantData  : undefined,
      })

      if (result.success) {
        setToast({ type: 'success', message: 'Order created successfully!' })
        setTimeout(() => router.push('/admin/dashboard'), 1500)
      } else {
        setToast({ type: 'error', message: result.error })
        setTimeout(() => setToast(null), 4000)
      }
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Back nav */}
      <button
        onClick={() => step === 1 ? router.push('/admin/dashboard') : setStep(1)}
        className="flex items-center gap-1 text-sm text-slate-500 mb-4 active:scale-95 transition-transform"
      >
        ← {step === 1 ? 'Dashboard' : 'Back'}
      </button>

      <h1 className="text-xl font-bold text-slate-900 mb-1">New Order</h1>
      <StepIndicator current={step} />

      {/* ══════════════ STEP 1: CUSTOMER INFO ══════════════ */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
              Customer Details
            </h2>

            {/* Name */}
            <div>
              <label htmlFor="name" className="label">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Ramesh Patil"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`input ${step1Errors.name ? 'border-red-400' : ''}`}
              />
              {step1Errors.name && (
                <p className="text-xs text-red-500 mt-1">{step1Errors.name}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="label">Mobile Number</label>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={`input ${step1Errors.mobile ? 'border-red-400' : ''}`}
              />
              {step1Errors.mobile && (
                <p className="text-xs text-red-500 mt-1">{step1Errors.mobile}</p>
              )}
            </div>

            {/* Delivery Date */}
            <div>
              <label htmlFor="deliveryDate" className="label">Delivery Date</label>
              <input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={`input ${step1Errors.deliveryDate ? 'border-red-400' : ''}`}
              />
              {step1Errors.deliveryDate && (
                <p className="text-xs text-red-500 mt-1">{step1Errors.deliveryDate}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="label">
                Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                placeholder="e.g. Rush order, specific fabric, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input resize-none"
              />
            </div>
          </div>

          <button onClick={handleNext} className="btn-primary">
            Next: Measurements →
          </button>
        </div>
      )}

      {/* ══════════════ STEP 2: MEASUREMENTS ══════════════ */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Unit toggle */}
          <div className="card flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Unit</span>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              {(['cm', 'inches'] as Unit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors
                    ${unit === u
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Shirt / Pant tabs */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white">
            {(['shirt', 'pant'] as MeasTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setMeasTab(tab)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors capitalize
                  ${measTab === tab
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {tab === 'shirt' ? '👔 Shirt' : '👖 Pant'}
              </button>
            ))}
          </div>

          {/* Shirt fields */}
          {measTab === 'shirt' && (
            <div className="card">
              <h2 className="font-semibold text-slate-700 text-sm mb-3">
                Shirt Measurements <span className="text-slate-400 font-normal">({unit})</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {SHIRT_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={`shirt-${field.key}`} className="label">
                      {field.label}
                    </label>
                    <input
                      id={`shirt-${field.key}`}
                      type="text"
                      inputMode="decimal"
                      placeholder={`0 ${unit}`}
                      value={shirt[field.key]}
                      onChange={(e) => updateShirt(field.key, e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pant fields */}
          {measTab === 'pant' && (
            <div className="card">
              <h2 className="font-semibold text-slate-700 text-sm mb-3">
                Pant Measurements <span className="text-slate-400 font-normal">({unit})</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {PANT_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={`pant-${field.key}`} className="label">
                      {field.label}
                    </label>
                    <input
                      id={`pant-${field.key}`}
                      type="text"
                      inputMode="decimal"
                      placeholder={`0 ${unit}`}
                      value={pant[field.key]}
                      onChange={(e) => updatePant(field.key, e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Measurement hint */}
          <p className="text-xs text-slate-400 text-center">
            Fill one or both tabs. Leave blank fields empty — they won&apos;t be saved.
          </p>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="btn-primary"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating Order…
              </span>
            ) : (
              '✓ Create Order'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
