import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = ["/dashboard", "/study-session", "/timer"];
  
  // Check if the current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // ⚡️ FAST CHECK: Just check if the cookie exists
    // We don't verify it here (too slow/impossible on Edge). 
    // The actual page (Server Component) will verify it securely.
    const sessionCookie = request.cookies.get("better-auth.session_token") || 
                          request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
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
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};