import { NextRequest, NextResponse } from 'next/server'

// Simple password-based auth for the CMS
// In production, replace with proper auth (NextAuth, Clerk, etc.)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sanaa2025'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  // Set a session cookie (valid for 7 days)
  const response = NextResponse.json({ success: true })
  response.cookies.set('sanaa_auth', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}