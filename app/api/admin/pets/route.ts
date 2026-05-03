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
    const search = searchParams.get('search');

    // Fetch pets without joining user_profiles (to avoid relationship error)
    let query = supabaseAdmin
      .from('pets')
      .select('*');

    if (search) {
      query = query.or(`name.ilike.%${search}%,breed.ilike.%${search}%`);
    }

    const { data: pets, error } = await query;

    if (error) throw error;

    // Fetch owner information for each pet separately
    const petsWithOwners = await Promise.all(
      (pets || []).map(async (pet: any) => {
        const { data: owner } = await supabaseAdmin
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', pet.owner_id)
          .single();

        return {
          id: pet.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          healthScore: pet.health_score || 80,
          owner: owner?.full_name || 'Unknown',
          vaccinationStatus: pet.vaccination_status || 'up-to-date',
          lastCheckup: pet.date_of_birth,
          activityLevel: pet.activity_level || 'medium',
        };
      })
    );

    return NextResponse.json(petsWithOwners);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
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
    const { petId, healthScore, vaccinationStatus, activityLevel } = await request.json();

    const updateData: any = { health_score: healthScore };
    if (vaccinationStatus) updateData.vaccination_status = vaccinationStatus;
    if (activityLevel) updateData.activity_level = activityLevel;

    const { error } = await supabaseAdmin
      .from('pets')
      .update(updateData)
      .eq('id', petId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 });
  }
}
