import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default async function middleware(req: NextRequest) {
  // Define protected routes
  const protectedRoutes = ['/dashboard', '/study-session', '/timer']
  
  // Check if the current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  if (isProtectedRoute) {
    const session = await auth.api.getSession({
      headers: req.headers
    })
    
    // If no session, redirect to home
    if (!session?.user) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
