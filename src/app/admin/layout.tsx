import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminHeader from './AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Double-check role server-side (middleware also protects, but defense-in-depth)
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Allow login page through even for non-admin (middleware redirects if needed)
    if (profile && profile.role !== 'admin') {
      redirect('/login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <main className="max-w-lg mx-auto px-4 pb-24 pt-4">
        {children}
      </main>
    </div>
  )
}
