import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  
  // Clear all auth cookies
  response.cookies.set('sb-auth-token', '', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  response.cookies.set('is-admin', '', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
