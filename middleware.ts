import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/auth',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/session',
    '/api/auth/csrf',
    '/api/auth/providers',
    '/api/auth/callback',
    '/api/auth/verify-request',
    '/api/auth/error',
    '/_next',
    '/favicon.ico',
  ]

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith(path + '/') ||
    pathname.startsWith('/_next/')
  )

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Get the session token
  const token = await getToken({ req: request })

  // If there's no token and the path is not public, redirect to login
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Allow access to protected routes if authenticated
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
