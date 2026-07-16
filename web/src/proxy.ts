import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionFromCookie } from '@/lib/session'

const protectedRoutes = ['/dashboard', '/projeto']
const authRoutes = ['/']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const user = getSessionFromCookie(request.cookies.get('ivy_session')?.value)

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuth = authRoutes.some(route => pathname === route)

  if (isProtected && !user) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuth && user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/projeto/:path*'],
}
