'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CustomerHeader() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-amber-100/50 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Scissors icon */}
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
            />
          </svg>
          <span className="font-bold text-sm tracking-wide text-slate-900">Supreme Tailors</span>
        </div>

        <button
          onClick={handleSignOut}
          className="text-xs text-slate-600 hover:text-slate-900 transition-all py-1 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-amber-200 active:scale-95"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
