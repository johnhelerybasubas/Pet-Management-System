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
    const { data: alerts, error } = await supabaseAdmin
      .from('emergency_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch related data for each alert
    const alertsWithDetails = await Promise.all(
      (alerts || []).map(async (alert: any) => {
        let targetUser = null;
        if (alert.target_user_id) {
          const { data: user } = await supabaseAdmin
            .from('user_profiles')
            .select('email, full_name')
            .eq('id', alert.target_user_id)
            .single();
          targetUser = user;
        }

        return {
          ...alert,
          target_user: targetUser,
        };
      })
    );

    return NextResponse.json(alertsWithDetails);
  } catch (error) {
    console.error('Error fetching emergency alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch emergency alerts' }, { status: 500 });
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
    const body = await request.json();
    const { title, description, severity, targetUserId, sendToAll, createdBy } = body;

    const { data, error } = await supabaseAdmin
      .from('emergency_alerts')
      .insert({
        title,
        description,
        severity,
        target_user_id: targetUserId || null,
        send_to_all: sendToAll || false,
        status: 'active',
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating emergency alert:', error);
    return NextResponse.json({ error: 'Failed to create emergency alert' }, { status: 500 });
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
    const body = await request.json();
    const { alertId, status, title, description, severity, targetUserId, sendToAll } = body;

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
    }
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (severity !== undefined) updateData.severity = severity;
    if (targetUserId !== undefined) updateData.target_user_id = targetUserId;
    if (sendToAll !== undefined) updateData.send_to_all = sendToAll;

    const { data, error } = await supabaseAdmin
      .from('emergency_alerts')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating emergency alert:', error);
    return NextResponse.json({ error: 'Failed to update emergency alert' }, { status: 500 });
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
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('emergency_alerts')
      .delete()
      .eq('id', alertId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting emergency alert:', error);
    return NextResponse.json({ error: 'Failed to delete emergency alert' }, { status: 500 });
  }
}
