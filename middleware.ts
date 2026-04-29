import { auth } from "@/app/auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await auth();

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

  // If accessing protected route without session, redirect to appropriate login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL(isAdminRoute ? '/admin-login' : '/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth route while logged in, redirect to dashboard
  if (isAuthRoute && session) {
    const dashboardUrl = new URL(isAdminRoute ? '/admin/dashboard' : '/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
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
