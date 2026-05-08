'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerAction } from '@/app/actions/authActions'

function NeedleDecor() {
  return (
    <svg className="w-14 h-14 text-amber-600/70 mx-auto animate-needle" viewBox="0 0 80 80" fill="none">
      <line x1="20" y1="60" x2="60" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="62" cy="8" r="3.5" fill="currentColor" />
      <path d="M18 62 Q10 50, 20 42 Q30 34, 22 24 Q14 16, 24 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await registerAction(formData)
      if (result.success) {
        router.push('/orders')
        router.refresh()
      } else {
        setError(result.error ?? 'Registration failed')
      }
    })
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-tailor-pattern pointer-events-none" />

      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,300 Q200,250 400,320 T800,280" stroke="#c8a96e" strokeWidth="2" fill="none" strokeDasharray="8 6" />
      </svg>

      <div className="relative z-10 w-full max-w-sm">
        <div className="glass-card rounded-2xl shadow-xl shadow-amber-900/5 p-6 space-y-6 animate-fade-in-up">
          <div className="text-center">
            <NeedleDecor />
            <h1 className="text-2xl font-bold text-slate-900 mt-3">Create Account</h1>
            <p className="text-sm text-slate-500 mt-1">Join Supreme Tailors to track your orders</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 stagger-children">
            <div className="animate-fade-in-up">
              <label htmlFor="name" className="label">Full Name</label>
              <input id="name" name="name" type="text" required className="input" placeholder="Ramesh Patil" />
            </div>

            <div className="animate-fade-in-up">
              <label htmlFor="mobile" className="label">Mobile Number</label>
              <input id="mobile" name="mobile" type="tel" required pattern="[0-9]{10}" title="10 digit mobile number" className="input" placeholder="10-digit number" />
            </div>

            <div className="animate-fade-in-up">
              <label htmlFor="email" className="label">Email Address</label>
              <input id="email" name="email" type="email" required className="input" placeholder="ramesh@example.com" />
            </div>

            <div className="animate-fade-in-up">
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" required minLength={6} className="input" placeholder="Minimum 6 characters" />
            </div>

            {error && <p className="text-sm text-red-500 text-center animate-fade-in">{error}</p>}

            <button type="submit" disabled={isPending} className="btn-primary mt-2 relative overflow-hidden group">
              <span className="relative z-10">
                {isPending ? 'Creating account...' : 'Sign Up'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-700 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <Link href="/" className="block text-center text-xs text-slate-400 mt-4 hover:text-slate-600 transition-colors">
          ← Back to home
        </Link>
      </div>
    </main>
  )
}
