import { supabase, supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const emailRedirectTo = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?verified=1`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create user profile automatically when they sign up
    if (data.user) {
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: email.split('@')[0], // Use email prefix as default name
          role: 'user',
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail the signup if profile creation fails - user can still login
      } else {
        console.log('User profile created for:', data.user.id);
      }
    }

    return NextResponse.json(
      {
        message: 'Signup successful! Check your email for the Supabase confirmation link.',
        email,
        user: data.user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Sign up failed' },
      { status: 500 }
    );
  }
}
