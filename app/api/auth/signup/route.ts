import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PASSWORD_MIN_LENGTH, publicSignupEnabled } from '@/lib/auth-flags'
import { requestIp } from '@/lib/rate-limit'
import { allowAuthRate, tooManyRequests } from '@/lib/durable-rate'

const SignUpSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(200),
  fullName: z.string().trim().min(1).max(200),
})

export async function GET() {
  return NextResponse.json({ signupEnabled: publicSignupEnabled() })
}

/** Gate only. When allowed, the browser completes sign-up with GoTrue so the session is set. */
export async function POST(req: NextRequest) {
  const ip = requestIp(req.headers)
  if (!(await allowAuthRate(ip))) return tooManyRequests()

  if (!publicSignupEnabled()) {
    return NextResponse.json(
      { error: 'Sign-up is invite only. Ask your Cytron administrator for an account.' },
      { status: 403 },
    )
  }

  const raw = await req.json().catch(() => null)
  const parsed = SignUpSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters, and all fields are required.` },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true })
}
