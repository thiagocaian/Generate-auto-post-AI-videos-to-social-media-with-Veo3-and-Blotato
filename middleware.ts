import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PUBLIC_MARKETING_ROUTES } from '@/lib/site-routes'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  // Public static assets and generated metadata images must not require auth
  const isPublicAsset =
    /\.[a-z0-9]+$/i.test(pathname) ||
    pathname.startsWith('/opengraph-image') ||
    pathname.startsWith('/twitter-image') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-icon') ||
    pathname === '/manifest.json'
  if (isPublicAsset) {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Missing env vars → deny, do not silently allow
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const isLoginPage = pathname === '/login'
  const isPublicPath =
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname.startsWith('/auth/callback') ||
    request.nextUrl.pathname.startsWith('/images') ||
    request.nextUrl.pathname === '/forgot-password' ||
    request.nextUrl.pathname === '/reset-password' ||
    request.nextUrl.pathname === '/booking' ||
    request.nextUrl.pathname === '/onboarding' ||
    PUBLIC_MARKETING_ROUTES.includes(request.nextUrl.pathname) ||
    ['/sitemap.xml', '/robots.txt'].includes(request.nextUrl.pathname)

  // Skip auth check for public paths (API routes protect themselves)
  if (isPublicPath) {
    return NextResponse.next({ request: { headers: request.headers } })
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
