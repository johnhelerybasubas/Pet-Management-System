import { supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to get user from token (handles both real and mock tokens)
async function getUserFromToken(token: string) {
  // Check if it's a mock token (for development)
  if (token.startsWith('mock-token-')) {
    return {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'demo@example.com',
    };
  }

  // Otherwise, try to validate with Supabase
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    let userId: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const user = await getUserFromToken(token);

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    } else {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Fetch pet count
    const { count: petCount } = await supabaseAdmin
      .from('pets')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    // Fetch upcoming appointments count (next 7 days) for notifications
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const { count: upcomingCount } = await supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .lte('appointment_date', sevenDaysLater.toISOString().split('T')[0]);

    // Fetch overdue vaccinations for notifications
    const { data: userPets } = await supabaseAdmin
      .from('pets')
      .select('id')
      .eq('owner_id', userId);

    let overdueVaccinations = 0;
    if (userPets && userPets.length > 0) {
      const petIds = userPets.map(p => p.id);
      const { count } = await supabaseAdmin
        .from('vaccinations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue')
        .in('pet_id', petIds);
      overdueVaccinations = count || 0;
    }

    const totalNotifications = (upcomingCount || 0) + overdueVaccinations;

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || profile.email.split('@')[0],
        avatar_url: profile.avatar_url,
        phone_number: profile.phone_number,
        address: profile.address,
        role: profile.role,
        created_at: profile.created_at,
      },
      stats: {
        pet_count: petCount || 0,
        upcoming_appointments: upcomingCount || 0,
        overdue_vaccinations: overdueVaccinations,
        total_notifications: totalNotifications,
      },
    });
  } catch (error) {
    console.error('Profile endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
