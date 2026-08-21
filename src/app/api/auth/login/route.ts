import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { send2FACode } from '@/lib/email'

// In-memory 2FA code store (expires in 5 min)
const twoFACodes = new Map<string, { code: string; expires: number; email: string; role: string; authorId: string }>()

function generate2FACode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// Seed admin user if not exists (first request only)
let adminSeeded = false
async function seedAdmin() {
  if (adminSeeded) return
  const adminEmail = 'admin@sanaathrumylens.co.ke'
  const existing = await db.user.findUnique({ where: { email: adminEmail } }).catch(() => null)
  if (!existing) {
    const hash = await bcrypt.hash('sanaa2025', 10)
    await db.user.create({ data: { email: adminEmail, password: hash, role: 'admin' } }).catch(() => {})
  }
  adminSeeded = true
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, code, step } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await seedAdmin()

    const normalizedEmail = email.toLowerCase().trim()

    // ── STEP 1: Validate credentials ──
    const user = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Admin login — no 2FA, set cookies immediately
    if (user.role === 'admin') {
      let redirect = '/admin'
      const response = NextResponse.json({ success: true, role: 'admin', redirect })
      setAuthCookies(response, normalizedEmail, 'admin', '')
      return response
    }

    // ── STEP 2: 2FA for editors ──
    // If step === 'verify', check the code
    if (step === 'verify' && code) {
      const stored = twoFACodes.get(normalizedEmail)
      if (!stored || stored.code !== String(code) || Date.now() > stored.expires) {
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
      }
      twoFACodes.delete(normalizedEmail) // one-time use

      let redirect = '/dashboard'
      const response = NextResponse.json({ success: true, role: 'editor', redirect, authorId: stored.authorId })
      setAuthCookies(response, normalizedEmail, 'editor', stored.authorId)
      return response
    }

    // Send 2FA code
    const twoFACode = generate2FACode()
    twoFACodes.set(normalizedEmail, {
      code: twoFACode,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      email: normalizedEmail,
      role: user.role,
      authorId: user.authorId || '',
    })

    // Send 2FA code via email
    const emailOk = await send2FACode({ to: normalizedEmail, code: twoFACode })
    if (!emailOk) {
      console.error(`Failed to send 2FA code to ${normalizedEmail}`)
      return NextResponse.json({ error: 'Failed to send verification email. Please try again or contact the admin.' }, { status: 500 })
    }

    return NextResponse.json({ requires2FA: true, message: 'Verification code sent to your email' })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

function setAuthCookies(response: NextResponse, email: string, role: string, authorId: string) {
  const opts = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }
  response.cookies.set('sanaa_auth', 'authenticated', { ...opts, httpOnly: true })
  response.cookies.set('sanaa_role', role, opts)
  response.cookies.set('sanaa_user', email, opts)
  if (authorId) {
    response.cookies.set('sanaa_author_id', authorId, opts)
  }
}
