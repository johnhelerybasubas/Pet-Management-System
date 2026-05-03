import { supabaseAdmin } from '@/app/lib/supabase';
import { verifyAdminAuth, handleUnauthorized } from '@/app/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      console.log('[BOOKINGS API] Auth failed:', auth.error);
      return handleUnauthorized(auth.error);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    console.log('[BOOKINGS API] Fetching REAL appointments with filters:', { search, status, category });

    // Fetch appointments without joins
    let query = supabaseAdmin
      .from('appointments')
      .select('*');

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('[BOOKINGS API] Error fetching appointments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!appointments || appointments.length === 0) {
      console.log('[BOOKINGS API] No appointments found in database');
      return NextResponse.json([]);
    }

    // Fetch related data for each appointment
    const bookings = await Promise.all(
      (appointments || []).map(async (appointment: any) => {
        // Fetch pet info
        const { data: pet } = await supabaseAdmin
          .from('pets')
          .select('name, type')
          .eq('id', appointment.pet_id)
          .single() as { data: { name: string; type: string } | null };

        // Fetch user info
        const { data: user } = await supabaseAdmin
          .from('user_profiles')
          .select('full_name')
          .eq('id', appointment.user_id)
          .single() as { data: { full_name: string } | null };

        // Fetch service info
        const { data: service } = await supabaseAdmin
          .from('services')
          .select('name, category')
          .eq('id', appointment.service_id)
          .single() as { data: { name: string; category: string } | null };

        return {
          id: appointment.id,
          petName: pet?.name || 'Unknown',
          petType: pet?.type || 'dog',
          owner: user?.full_name || 'Unknown',
          service: service?.name || 'Service',
          category: service?.category || 'vet',
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          status: appointment.status,
          notes: appointment.notes,
        };
      })
    );

    // Filter by category if specified
    let filteredBookings = bookings;
    if (category && category !== 'all') {
      filteredBookings = bookings.filter((b) => b.category === category);
    }

    // Filter by search if specified
    if (search) {
      filteredBookings = filteredBookings.filter(
        (b) =>
          b.petName.toLowerCase().includes(search.toLowerCase()) ||
          b.owner.toLowerCase().includes(search.toLowerCase()) ||
          b.service.toLowerCase().includes(search.toLowerCase())
      );
    }

    console.log('[BOOKINGS API] Returning', filteredBookings.length, 'REAL bookings from database');
    return NextResponse.json(filteredBookings);
  } catch (error) {
    console.error('[BOOKINGS API] Exception:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authorized) {
    return handleUnauthorized(auth.error);
  }

  try {
    const { bookingId, status } = await request.json();

    const { error } = await (supabaseAdmin
      .from('appointments') as unknown as { update: (data: { status: string }) => { eq: (field: string, value: string) => Promise<{ error: Error | null }> } })
      .update({ status })
      .eq('id', bookingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authorized) {
    return handleUnauthorized(auth.error);
  }

  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('appointments')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
