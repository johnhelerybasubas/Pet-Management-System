import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/pets', '/services', '/booking', '/admin/dashboard', '/'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Auth routes that should not be accessible when logged in
  const authRoutes = ['/login', '/signup', '/admin-login', '/verify-email'];
  const isAuthRoute = authRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if accessing admin route
  const isAdminRoute = pathname.startsWith('/admin');

  // Check if user has auth session in cookies
  const authToken = req.cookies.get('sb-auth-token')?.value;
  const hasSession = !!authToken;

  // If accessing protected route without session, redirect to appropriate login
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL(isAdminRoute ? '/admin-login' : '/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api folder (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
