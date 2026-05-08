import Link from 'next/link'

export default function Home() {
  return (
    <main className="page-wrapper flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Supreme Tailors</h1>
        <p className="text-slate-500 mt-2 text-sm">
          Professional tailoring, perfectly managed.
        </p>
      </div>

      <div className="w-full space-y-3">
        <Link href="/login" className="btn-primary block text-center">
          Customer Login
        </Link>
        <Link href="/admin/login" className="btn-secondary block text-center">
          Admin Login
        </Link>
      </div>
    </main>
  )
}
