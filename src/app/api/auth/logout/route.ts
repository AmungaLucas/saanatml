import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    const clearOpts = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: 0, path: '/' }
    response.cookies.set('sanaa_auth', '', { ...clearOpts, httpOnly: true })
    response.cookies.set('sanaa_role', '', clearOpts)
    response.cookies.set('sanaa_user', '', clearOpts)
    response.cookies.set('sanaa_author_id', '', clearOpts)
    return response
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
