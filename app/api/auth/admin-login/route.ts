import { supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Authenticate with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      console.error('Profile error details:', JSON.stringify(profileError, null, 2));
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        const { error: insertError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            role: 'user', // Default to user, not admin
          });
        if (insertError) {
          console.error('Profile insert error:', insertError);
          return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Account created but not admin. Contact administrator.' }, { status: 403 });
      }
      return NextResponse.json({ error: `Failed to fetch user profile: ${profileError.message}` }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const response = NextResponse.json({
      user: data.user,
      session: data.session,
      requires2FA: false, // Set to true if you implement real 2FA
    });

    // Set session cookie
    if (data.session) {
      response.cookies.set('sb-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      
      // Set admin flag cookie
      response.cookies.set('is-admin', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    console.error('Admin login exception:', error);
    return NextResponse.json(
      { error: 'Admin login failed' },
      { status: 500 }
    );
  }
}
