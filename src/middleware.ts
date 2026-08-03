import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/admin', '/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  if (isProtected) {
    const authCookie = request.cookies.get('sanaa_auth')

    if (!authCookie || authCookie.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}