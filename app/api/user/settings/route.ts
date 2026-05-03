import { supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: user, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, avatar_url, phone_number, address } = body;

    // Update user profile
    const { data: profile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        full_name: full_name || undefined,
        avatar_url: avatar_url || undefined,
        phone_number: phone_number || undefined,
        address: address || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Settings endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
