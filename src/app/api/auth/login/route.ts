import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple email+password auth for the CMS
// In production, replace with proper auth (NextAuth, Clerk, etc.)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sanaathrumylens.co.ke'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sanaa2025'

interface UserDef { password: string; role: 'admin' | 'editor'; authorEmail?: string }

// Support multiple users (admin + editors)
const USERS: Record<string, UserDef> = {
  [ADMIN_EMAIL]: { password: ADMIN_PASSWORD, role: 'admin' },
  'editor@sanaathrumylens.co.ke': { password: 'editor2025', role: 'editor', authorEmail: 'editor@sanaathrumylens.co.ke' },
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const userDef = USERS[normalizedEmail]

    if (!userDef || password !== userDef.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // For editors, try to find their author record so the dashboard can auto-fill it
    let authorId = ''
    if (userDef.role === 'editor') {
      try {
        const author = await db.author.findFirst({ where: { slug: normalizedEmail.split('@')[0] } })
        if (author) authorId = author.id
      } catch { /* non-critical */ }
    }

    // Set a session cookie (valid for 7 days)
    const response = NextResponse.json({ success: true, email: normalizedEmail, role: userDef.role, authorId })
    response.cookies.set('sanaa_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    response.cookies.set('sanaa_role', userDef.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    response.cookies.set('sanaa_user', normalizedEmail, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    // Store author ID so editor dashboard can auto-select it
    if (authorId) {
      response.cookies.set('sanaa_author_id', authorId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
