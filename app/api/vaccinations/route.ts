import { supabase } from '@/app/lib/supabase';
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
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function GET(request: NextRequest) {
  try {
    // Get the current session or auth header token
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const user = await getUserFromToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = session.user.id;
    }

    // Get all pets for the current user
    const { data: userPets, error: petsError } = await supabase
      .from('pets')
      .select('id')
      .eq('owner_id', userId);

    if (petsError) {
      return NextResponse.json({ error: petsError.message }, { status: 400 });
    }

    const petIds = userPets?.map(p => p.id) || [];

    if (petIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch vaccinations for user's pets with pet data
    const { data: vaccinations, error } = await supabase
      .from('vaccinations')
      .select('*, pets(name, type)')
      .in('pet_id', petIds)
      .order('vaccination_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(vaccinations);
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vaccinations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vaccination = await request.json();

    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id')
      .eq('id', vaccination.pet_id)
      .eq('owner_id', user.id);

    if (petError || !pet || pet.length === 0) {
      return NextResponse.json(
        { error: 'Pet not found or unauthorized' },
        { status: 403 }
      );
    }

    const { data: createdVaccination, error } = await supabase
      .from('vaccinations')
      .insert([vaccination])
      .select('*, pets(name, type)');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(createdVaccination, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create vaccination record' },
      { status: 500 }
    );
  }
}
