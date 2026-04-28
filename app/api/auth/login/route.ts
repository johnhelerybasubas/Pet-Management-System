import { supabase, supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Ensure user profile exists (fallback for users who signed up before this fix)
    if (data.user) {
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        console.log('Creating profile for existing user:', data.user.id);
        await supabaseAdmin.from('user_profiles').insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: email.split('@')[0],
            role: 'user',
          },
        ]);
      }
    }

    const response = NextResponse.json({
      user: data.user,
      session: data.session,
    });

    // Set session cookie
    if (data.session) {
      response.cookies.set('sb-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    console.error('Login exception:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
