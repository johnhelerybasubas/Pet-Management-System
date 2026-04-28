import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Allow larger body size for image uploads (10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Helper function to get user from token (handles both real and mock tokens)
async function getUserFromToken(token: string) {
  // Check if it's a mock token (for development)
  if (token.startsWith('mock-token-')) {
    // This is a mock token, return a standard user object
    // Must match the UUID in auth-context.tsx for demo user
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

    // Fetch pets for the current user
    const { data: pets, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(pets);
  } catch (error) {
    console.error('Pets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pet = await request.json();

    console.log('API received pet data with image:', pet.image_url ? `${pet.image_url.substring(0, 100)}...` : 'no image');

    // Add owner_id to the pet
    let petData: any = {
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      date_of_birth: pet.date_of_birth,
      allergies: pet.allergies || [],
      health_score: pet.health_score || 80,
      vaccination_status: pet.vaccination_status || 'up-to-date',
      activity_level: pet.activity_level || 'medium',
      owner_id: user.id,
    };

    // Only include microchip_id if provided
    if (pet.microchip_id) {
      petData.microchip_id = pet.microchip_id;
    }

    // Only include image_url if provided
    if (pet.image_url) {
      petData.image_url = pet.image_url;
    }

    // Create an authenticated client with the user's token
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Set the user's session for proper RLS context
    await userClient.auth.setSession({ access_token: token, refresh_token: '' });

    const { data: petResult, error } = await userClient
      .from('pets')
      .insert([petData])
      .select();

    if (error) {
      console.error('Pet insertion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(petResult, { status: 201 });
  } catch (error) {
    console.error('Pet creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create pet' },
      { status: 500 }
    );
  }
}
