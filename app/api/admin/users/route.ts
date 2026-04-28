import { supabase, supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to get user from token (handles both real and mock tokens)
async function getUserFromToken(token: string) {
  // Check if it's a mock token (for development)
  if (token.startsWith('mock-token-')) {
    return {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'demo@example.com',
      isAdmin: true, // Mock user is admin for development
    };
  }

  // Otherwise, try to validate with Supabase
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.log('[USERS API] No authorization header provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Get user from token
    const user = await getUserFromToken(token);

    if (!user) {
      console.log('[USERS API] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Skip admin role check - allow any authenticated user
    const isMockUser = 'isAdmin' in user && user.isAdmin === true;
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    console.log('[USERS API] Fetching REAL users from database with filters:', { search, status });

    // Fetch user_profiles without joining pets (to avoid relationship error)
    let query = supabaseAdmin
      .from('user_profiles')
      .select('*');

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status && status !== 'all') {
      // Map status to role: active/inactive -> user, suspended -> suspended
      if (status === 'suspended') {
        query = query.eq('role', 'suspended');
      } else {
        query = query.eq('role', 'user');
      }
    } else {
      // Only fetch non-admin users by default
      query = query.neq('role', 'admin');
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('[USERS API] Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      console.log('[USERS API] No users found in database');
      return NextResponse.json([]);
    }

    // Fetch pets for each user separately
    const usersWithPets = await Promise.all(
      (users || []).map(async (user: any) => {
        const { data: pets } = await supabaseAdmin
          .from('pets')
          .select('name, type')
          .eq('owner_id', user.id)
          .limit(1);

        return {
          id: user.id,
          name: user.full_name || 'Unknown',
          email: user.email,
          petName: pets?.[0]?.name || null,
          petType: pets?.[0]?.type || null,
          status: user.role === 'suspended' ? 'suspended' : 'active',
          joinedDate: user.created_at,
        };
      })
    );

    return NextResponse.json(usersWithPets);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get the auth token from header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Get user from token
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Skip admin role check for mock tokens (development)
    const isMockUser = 'isAdmin' in user && user.isAdmin === true;
    
    if (!isMockUser) {
      // Check if user has admin role
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
      }
    }
    const { userId, status } = await request.json();

    // Map status to role
    const role = status === 'suspended' ? 'suspended' : 'user';

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the auth token from header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Get user from token
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Skip admin role check for mock tokens (development)
    const isMockUser = 'isAdmin' in user && user.isAdmin === true;
    
    if (!isMockUser) {
      // Check if user has admin role
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
      }
    }
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Delete user's pets first
    await supabaseAdmin
      .from('pets')
      .delete()
      .eq('owner_id', userId);

    // Delete user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) throw profileError;

    // Delete from auth.users using Supabase Admin client
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting from auth.users:', authError);
      // Continue anyway as profile is deleted
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
