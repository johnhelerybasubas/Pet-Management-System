import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: user, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, avatar_url, phone_number, address } = body;

    // Update user profile
    const { data: profile, error: updateError } = await supabase
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
