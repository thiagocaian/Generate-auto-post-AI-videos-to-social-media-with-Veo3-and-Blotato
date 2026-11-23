import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isProtectedAppPath } from '@/lib/security/protected-routes'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/login'

  // Gate only real app routes. Unknown public URLs must reach the router so
  // app/not-found.tsx can answer HTTP 404. /login stays in the matcher so a
  // signed-in user is still sent to the dashboard.
  if (!isProtectedAppPath(pathname) && !isLoginPage) {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Missing env vars → deny protected routes, do not silently allow.
  if (!supabaseUrl || !supabaseKey) {
    if (isLoginPage) return NextResponse.next({ request: { headers: request.headers } })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    let response = NextResponse.next({
      request: { headers: request.headers },
    })

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    // getUser() validates the JWT server-side (getSession() only reads the cookie)
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      if (isLoginPage) return response
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Already logged in → redirect away from login
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch {
    // On any unexpected error, deny access instead of silently allowing
    if (isLoginPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/login',
    '/auth/signout',
    '/auth/signout/:path*',
    '/admin',
    '/admin/:path*',
    '/billing',
    '/billing/:path*',
    '/calendar',
    '/calendar/:path*',
    '/compliance',
    '/compliance/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/email-preview',
    '/email-preview/:path*',
    '/field-commander',
    '/field-commander/:path*',
    '/invoices',
    '/invoices/:path*',
    '/jobs',
    '/jobs/:path*',
    '/marketing',
    '/marketing/:path*',
    '/materials',
    '/materials/:path*',
    '/operator',
    '/operator/:path*',
    '/platforms',
    '/platforms/:path*',
    '/quotes',
    '/quotes/:path*',
    '/reports',
    '/reports/:path*',
    '/warehouse',
    '/warehouse/:path*',
  ],
}
