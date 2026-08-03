import { NextRequest, NextResponse } from 'next/server'

// Simple email+password auth for the CMS
// In production, replace with proper auth (NextAuth, Clerk, etc.)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sanaathrumylens.co.ke'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sanaa2025'

// Support multiple users (admin + editors)
const USERS: Record<string, string> = {
  [ADMIN_EMAIL]: ADMIN_PASSWORD,
  'editor@sanaathrumylens.co.ke': 'editor2025',
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const expectedPassword = USERS[normalizedEmail]

  if (!expectedPassword || password !== expectedPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  // Set a session cookie (valid for 7 days)
  const response = NextResponse.json({ success: true, email: normalizedEmail })
  response.cookies.set('sanaa_auth', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  // Store user email in a separate non-httpOnly cookie for UI display
  response.cookies.set('sanaa_user', normalizedEmail, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
