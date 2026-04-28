import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Helper function to get user from token (handles both real and mock tokens)
async function getUserFromToken(token: string, body?: any) {
  // Check if it's a mock token (development)
  if (token.startsWith('mock-token-')) {
    // For mock tokens, userId should come from request body
    if (body?.userId) {
      return { id: body.userId };
    }
    // Fallback to demo user UUID
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
    const { id: petId } = await params;
    
    // Get the auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Parse body for mock token user ID
    let body;
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }

    // Get user from token
    const user = await getUserFromToken(token, body);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the pet from the database
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId)
      .eq('owner_id', user.id); // Ensure user owns this pet

    if (error) {
      console.error('Pet deletion error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Pet deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Pet deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete pet' },
      { status: 500 }
    );
  }
}
