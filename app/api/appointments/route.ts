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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = session.user.id;
    }

    // Fetch appointments for the current user with related pet data
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, pets(name, type)')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Appointments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
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

    const appointment = await request.json();

    // Add user_id to the appointment
    const appointmentData = {
      ...appointment,
      user_id: user.id,
    };

    const { data: appointmentResult, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select('*, pets(name, type)');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(appointmentResult, { status: 201 });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
