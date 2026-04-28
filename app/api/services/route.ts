import { supabase } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { mockServices } from '@/app/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    // Always return mock services for now - Supabase may not have coordinates
    return NextResponse.json(mockServices);
  } catch (error) {
    console.log('API error:', error);
    return NextResponse.json(mockServices);
  }
}

export async function POST(request: NextRequest) {
  try {
    const service = await request.json();

    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
