import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isLoginPage = request.nextUrl.pathname === '/login'
  const isPublicPath =
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname.startsWith('/auth/callback') ||
    request.nextUrl.pathname === '/forgot-password' ||
    request.nextUrl.pathname === '/reset-password' ||
    request.nextUrl.pathname === '/landing' ||
    request.nextUrl.pathname === '/booking' ||
    request.nextUrl.pathname === '/operator' ||
    request.nextUrl.pathname === '/onboarding' ||
    request.nextUrl.pathname === '/terms' ||
    request.nextUrl.pathname === '/privacy' ||
    request.nextUrl.pathname === '/icon' ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/solutions/') ||
    request.nextUrl.pathname.startsWith('/warehouse/pick')

  // Skip auth check for public paths (API routes protect themselves)
  if (isPublicPath) {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  // Missing env vars → deny protected paths without trapping users in a login loop.
  if (!supabaseUrl || !supabaseKey) {
    if (isLoginPage) return NextResponse.next()
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
