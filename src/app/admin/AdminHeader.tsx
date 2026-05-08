'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminHeader() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Animated scissors */}
          <div className="animate-scissors">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
              />
            </svg>
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide">Supreme Tailors</span>
            <span className="text-[10px] text-amber-400/60 ml-1.5">ADMIN</span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="text-xs text-slate-300 hover:text-white transition-all py-1.5 px-3 rounded-lg border border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/10 active:scale-95"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
