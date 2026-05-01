import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for auth cookies - parse cookies properly
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  // Check for our custom auth token or Supabase auth token
  const hasCustomAuth = !!cookies['sb-auth-token'] || 
    Object.keys(cookies).some(key => key.includes('sb-') && key.includes('-auth-token'));

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

  // Skip middleware for force-logout route
  if (pathname === '/force-logout') {
    return NextResponse.next();
  }

  // Check if accessing admin route
  const isAdminRoute = pathname.startsWith('/admin');

  // If accessing protected route without custom auth
  if (isProtectedRoute && !hasCustomAuth) {
    const loginUrl = new URL(isAdminRoute ? '/admin-login' : '/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth route while logged in with custom auth, redirect to dashboard
  if (isAuthRoute && hasCustomAuth) {
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
