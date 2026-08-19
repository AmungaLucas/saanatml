import { NextRequest, NextResponse } from 'next/server'

/**
 * Defense-in-depth auth check for admin API routes.
 * The middleware already protects these routes, but this guard
 * ensures safety even if middleware is bypassed or misconfigured.
 *
 * Usage: at the top of any admin handler:
 *   const guard = requireAuth(request)
 *   if (guard) return guard
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  const authCookie = request.cookies.get('sanaa_auth')
  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
