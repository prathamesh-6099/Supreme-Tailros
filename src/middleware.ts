import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabase, supabaseResponse, user } = await createMiddlewareClient(request)

  // ─── Admin routes: /admin/* ───────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Allow /admin/login always (avoid redirect loop)
    if (pathname === '/admin/login') {
      // If already logged in as admin, redirect to dashboard
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
      }
      return supabaseResponse
    }

    // For all other /admin/* — must be authenticated as admin
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Authenticated but not admin — send to customer login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return supabaseResponse
  }

  // ─── Customer routes: /orders/* ──────────────────────────────────────────
  if (pathname.startsWith('/orders')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'customer') {
      // Logged in but not a customer (e.g. admin) — redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return supabaseResponse
  }

  // ─── Auth pages: redirect logged-in users away ───────────────────────────
  if ((pathname === '/login' || pathname === '/register') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    if (profile?.role === 'customer') {
      return NextResponse.redirect(new URL('/orders', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
