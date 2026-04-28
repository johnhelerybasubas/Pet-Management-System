import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params;
    
    // Get the auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Get user from token
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the appointment from the database
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) {
      console.error('Appointment deletion error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Appointment cancelled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Appointment deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
