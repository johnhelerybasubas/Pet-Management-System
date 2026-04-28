import { supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch alerts for this user or sent to all users
    const { data: alerts, error } = await supabaseAdmin
      .from('emergency_alerts')
      .select('*')
      .or(`target_user_id.eq.${user.id},send_to_all.eq.true`)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(alerts || []);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
