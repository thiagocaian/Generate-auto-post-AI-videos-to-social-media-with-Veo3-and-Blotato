import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { classifyRequestPath } from '@/lib/route-access'
import { safeNextPath } from '@/lib/safe-next'

function redirectToLogin(request: NextRequest) {
  const url = new URL('/login', request.url)
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
  return NextResponse.redirect(url)
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

async function readUser(request: NextRequest, supabaseUrl: string, supabaseKey: string) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request: { headers: request.headers } })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  return { user, response }
}

export async function middleware(request: NextRequest) {
  const kind = classifyRequestPath(request.nextUrl.pathname)
  if (kind === 'public') {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Public pages already returned. Missing env must not take the marketing
  // site down, and must not loop /login back onto itself.
  if (!supabaseUrl || !supabaseKey) {
    if (kind === 'api') return unauthorized()
    if (kind === 'login') return NextResponse.next({ request: { headers: request.headers } })
    return redirectToLogin(request)
  }

  try {
    const { user, response } = await readUser(request, supabaseUrl, supabaseKey)

    if (kind === 'api') {
      if (!user) return unauthorized()
      return response
    }

    if (kind === 'login') {
      if (!user) return response
      const dest = safeNextPath(request.nextUrl.searchParams.get('next'))
      return NextResponse.redirect(new URL(dest, request.url))
    }

    if (!user) return redirectToLogin(request)
    return response
  } catch {
    if (kind === 'api') return unauthorized()
    if (kind === 'login') return NextResponse.next({ request: { headers: request.headers } })
    return redirectToLogin(request)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
