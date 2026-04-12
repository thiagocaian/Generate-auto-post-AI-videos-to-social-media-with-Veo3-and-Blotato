import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If env vars are missing, skip auth check and let the page render
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.next()
    }

    let response = NextResponse.next({
      request: { headers: request.headers },
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
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
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    const isLoginPage = request.nextUrl.pathname === '/login'
    const isPublicPath = request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/favicon') ||
      request.nextUrl.pathname.startsWith('/auth/callback') ||
      request.nextUrl.pathname === '/forgot-password' ||
      request.nextUrl.pathname === '/reset-password' ||
      request.nextUrl.pathname === '/landing' ||
      request.nextUrl.pathname === '/booking' ||
      request.nextUrl.pathname === '/operator' ||
      request.nextUrl.pathname === '/'

    // Not logged in → redirect to login
    if (!session && !isLoginPage && !isPublicPath) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Already logged in → redirect away from login
    if (session && isLoginPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (e) {
    // If anything fails (missing env vars, Supabase error, etc.), let the request through
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
