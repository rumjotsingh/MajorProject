import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware - auth is handled client-side with localStorage
  // Protected routes use ProtectedRoute component instead
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/learner/:path*', '/employer/:path*', '/institute/:path*']
}
