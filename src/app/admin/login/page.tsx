'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions/authActions'

function ShieldIcon() {
  return (
    <svg className="w-14 h-14 text-amber-600/70 mx-auto" viewBox="0 0 64 64" fill="none">
      <path d="M32 6 L54 16 V34 C54 48 32 58 32 58 C32 58 10 48 10 34 V16 L32 6Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M22 32 L28 38 L42 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await loginAction(formData)
      if (result.success) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError(result.error ?? 'Login failed')
      }
    })
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(200,169,110,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 space-y-6 animate-fade-in-up">
          <div className="text-center">
            <ShieldIcon />
            <h1 className="text-2xl font-bold text-white mt-3">Admin Login</h1>
            <p className="text-sm text-slate-400 mt-1">Supreme Tailors Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                id="email" name="email" type="email" required
                className="w-full border border-slate-600 rounded-xl px-4 py-3 text-sm bg-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                placeholder="admin@supremetailors.com"
              />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                id="password" name="password" type="password" required
                className="w-full border border-slate-600 rounded-xl px-4 py-3 text-sm bg-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center animate-fade-in">{error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold py-3 px-4 rounded-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-900/30 relative overflow-hidden group mt-2"
            >
              <span className="relative z-10">
                {isPending ? 'Logging in...' : 'Log In'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            </button>
          </form>
        </div>

        <a href="/" className="block text-center text-xs text-slate-500 mt-4 hover:text-slate-300 transition-colors">
          ← Back to home
        </a>
      </div>
    </main>
  )
}
