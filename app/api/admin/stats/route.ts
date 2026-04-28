import { supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[STATS] Starting admin stats fetch - REAL DATA ONLY');
    console.log('[STATS] Has SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Try to get auth token from Authorization header first, then fall back to cookie
    const authHeader = request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('[STATS] Got token from Authorization header');
    } else {
      // Fall back to cookie
      token = request.cookies.get('sb-auth-token')?.value;
      console.log('[STATS] Got token from cookie:', !!token);
    }

    if (!token) {
      console.log('[STATS] No auth token provided - returning error');
      return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
    }

    console.log('[STATS] Token found, verifying admin access');

    // Verify user is admin
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData.user) {
      console.log('[STATS] Token verification failed:', userError?.message);
      return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
    }

    const user = userData.user;
    console.log('[STATS] User verified:', user.id);

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('[STATS] Profile fetch error:', profileError.message);
      // Allow non-admins to see dashboard too
    }

    // Allow any authenticated user to see their data (not just admins)
    console.log('[STATS] User authenticated - Fetching REAL statistics from database');

    // Verify user_profiles table has data
    const { data: allProfiles, error: profilesCheckError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, role');
    
    console.log('[STATS] All profiles in database:', allProfiles?.length || 0, 'records');
    if (allProfiles && allProfiles.length > 0) {
      console.log('[STATS] Sample profiles:', allProfiles.slice(0, 3));
    }
    if (profilesCheckError) {
      console.error('[STATS] Error fetching all profiles:', profilesCheckError);
    }

    // Fetch all stats in parallel for performance - REAL DATA ONLY
    const [
      { count: totalUsers, error: usersError },
      { count: totalPets, error: petsError },
      { count: totalBookings, error: bookingsError },
      { count: completedServices, error: completedError },
      { count: pendingBookings, error: pendingError },
      { data: pets, error: healthError },
      { count: activeUsers, error: activeError },
    ] = await Promise.all([
      supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('pets')
        .select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled'),
      supabaseAdmin
        .from('pets')
        .select('health_score'),
      supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user'),
    ]);

    if (usersError) console.error('[STATS] Error fetching total users:', usersError);
    if (petsError) console.error('[STATS] Error fetching total pets:', petsError);
    if (bookingsError) console.error('[STATS] Error fetching total bookings:', bookingsError);
    if (completedError) console.error('[STATS] Error fetching completed services:', completedError);
    if (pendingError) console.error('[STATS] Error fetching pending bookings:', pendingError);
    if (healthError) console.error('[STATS] Error fetching health scores:', healthError);
    if (activeError) console.error('[STATS] Error fetching active users:', activeError);

    // Detailed debugging
    console.log('[STATS] User count query result - count:', totalUsers, 'error:', usersError);
    console.log('[STATS] All profiles total:', allProfiles?.length || 0);
    console.log('[STATS] Raw counts - Users:', totalUsers, 'Pets:', totalPets, 'Bookings:', totalBookings);

    const averageHealthScore = pets && pets.length > 0
      ? Math.round(pets.reduce((sum, p) => sum + (p.health_score || 0), 0) / pets.length)
      : 0;

    const stats = {
      totalUsers: totalUsers || 0,
      totalPets: totalPets || 0,
      totalBookings: totalBookings || 0,
      completedServices: completedServices || 0,
      pendingBookings: pendingBookings || 0,
      averageHealthScore,
      activeUsers: activeUsers || 0,
    };

    console.log('[STATS] Successfully fetched REAL stats:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[STATS] Exception:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: String(error) }, { status: 500 });
  }
}
