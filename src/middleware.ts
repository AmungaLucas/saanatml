import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route (pages or API)
  const isProtectedPage = pathname.startsWith('/admin') || pathname.startsWith('/dashboard')
  const isProtectedAPI = pathname.startsWith('/api/admin') || pathname === '/api/cdn/delete'

  if (isProtectedPage || isProtectedAPI) {
    const authCookie = request.cookies.get('sanaa_auth')

    if (!authCookie || authCookie.value !== 'authenticated') {
      // API routes return 401 JSON; page routes redirect to login
      if (isProtectedAPI) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/api/admin/:path*', '/api/cdn/delete'],
}