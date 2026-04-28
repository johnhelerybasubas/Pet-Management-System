import { supabaseAdmin } from './supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function verifyAdminAuth(request: NextRequest) {
  try {
    const authToken = request.cookies.get('sb-auth-token')?.value;

    if (!authToken) {
      return { authorized: false, error: 'Unauthorized - No token' };
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(authToken);

    if (error || !user) {
      return { authorized: false, error: 'Invalid token' };
    }

    // Just verify user is authenticated (don't check admin role)
    return { authorized: true, userId: user.id, user };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authorized: false, error: 'Authentication failed' };
  }
}

export function handleUnauthorized(error: string = 'Unauthorized') {
  return NextResponse.json({ error }, { status: 401 });
}
