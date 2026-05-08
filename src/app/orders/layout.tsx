import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerHeader from './CustomerHeader'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile && profile.role !== 'customer') {
      redirect('/admin/dashboard')
    }
  } else {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <CustomerHeader />
      <main className="max-w-lg mx-auto px-4 pb-24 pt-4">
        {children}
      </main>
    </div>
  )
}
