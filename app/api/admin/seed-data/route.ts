import { supabaseAdmin } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[SEED] Starting data seeding...');

    // Check if this is being called from development/localhost
    const origin = request.headers.get('origin') || '';
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    
    if (process.env.NODE_ENV === 'production' && !isLocalhost) {
      return NextResponse.json({ error: 'Seeding not allowed in production' }, { status: 403 });
    }

    // Sample users
    const users = [
      { id: '550e8400-e29b-41d4-a716-446655440001', email: 'user1@example.com', fullName: 'John Doe' },
      { id: '550e8400-e29b-41d4-a716-446655440002', email: 'user2@example.com', fullName: 'Jane Smith' },
      { id: '550e8400-e29b-41d4-a716-446655440003', email: 'user3@example.com', fullName: 'Bob Johnson' },
      { id: '550e8400-e29b-41d4-a716-446655440004', email: 'user4@example.com', fullName: 'Alice Williams' },
      { id: '550e8400-e29b-41d4-a716-446655440005', email: 'user5@example.com', fullName: 'Charlie Brown' },
    ];

    // Insert or update users
    console.log('[SEED] Inserting users...');
    for (const user of users) {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          role: 'user',
        }, { onConflict: 'id' });

      if (error) {
        console.error(`[SEED] Error inserting user ${user.email}:`, error);
      }
    }

    // Sample pets
    console.log('[SEED] Inserting pets...');
    const petData = [
      { name: 'Max', owner_id: users[0].id, type: 'dog', breed: 'Golden Retriever', age: 3, weight: 25.5, dob: '2021-04-15', health: 85 },
      { name: 'Bella', owner_id: users[0].id, type: 'cat', breed: 'Persian', age: 2, weight: 4.2, dob: '2022-08-20', health: 90 },
      { name: 'Charlie', owner_id: users[1].id, type: 'dog', breed: 'Labrador', age: 4, weight: 30.0, dob: '2020-11-10', health: 78 },
      { name: 'Luna', owner_id: users[2].id, type: 'cat', breed: 'Siamese', age: 1, weight: 3.5, dob: '2023-05-05', health: 92 },
      { name: 'Rocky', owner_id: users[3].id, type: 'dog', breed: 'Bulldog', age: 5, weight: 22.0, dob: '2019-02-28', health: 75 },
      { name: 'Coco', owner_id: users[4].id, type: 'bird', breed: 'Parakeet', age: 2, weight: 0.1, dob: '2022-03-15', health: 88 },
      { name: 'Daisy', owner_id: users[1].id, type: 'rabbit', breed: 'Holland Lop', age: 1, weight: 2.0, dob: '2023-01-10', health: 95 },
      { name: 'Buddy', owner_id: users[2].id, type: 'dog', breed: 'German Shepherd', age: 3, weight: 32.0, dob: '2021-07-22', health: 82 },
    ];

    const petIds: string[] = [];
    for (const pet of petData) {
      const { data, error } = await supabaseAdmin
        .from('pets')
        .insert({
          owner_id: pet.owner_id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          date_of_birth: pet.dob,
          health_score: pet.health,
        })
        .select('id');

      if (error) {
        console.error(`[SEED] Error inserting pet ${pet.name}:`, error);
      } else if (data && data[0]) {
        petIds.push(data[0].id);
      }
    }

    // Sample services
    console.log('[SEED] Inserting services...');
    const services = [
      { name: 'Downtown Veterinary Clinic', category: 'vet', address: '123 Main St', phone: '555-0101', rating: 4.8 },
      { name: 'Paws & Grooming', category: 'grooming', address: '456 Oak Ave', phone: '555-0102', rating: 4.6 },
      { name: 'Pet Daycare Paradise', category: 'boarding', address: '789 Pine Rd', phone: '555-0103', rating: 4.7 },
      { name: 'Westside Animal Hospital', category: 'vet', address: '321 Elm St', phone: '555-0104', rating: 4.9 },
    ];

    const serviceIds: string[] = [];
    for (const service of services) {
      const { data, error } = await supabaseAdmin
        .from('services')
        .insert({
          name: service.name,
          category: service.category,
          address: service.address,
          phone: service.phone,
          rating: service.rating,
        })
        .select('id');

      if (error) {
        console.error(`[SEED] Error inserting service ${service.name}:`, error);
      } else if (data && data[0]) {
        serviceIds.push(data[0].id);
      }
    }

    // Sample appointments
    console.log('[SEED] Inserting appointments...');
    if (petIds.length > 0 && serviceIds.length > 0) {
      const appointmentDates = [
        { petIdx: 0, offset: 1, status: 'scheduled', notes: 'Annual checkup' },
        { petIdx: 2, offset: 3, status: 'scheduled', notes: 'Grooming session' },
        { petIdx: 4, offset: 5, status: 'scheduled', notes: 'Health checkup' },
        { petIdx: 6, offset: 2, status: 'scheduled', notes: 'Nail trimming' },
        { petIdx: 1, offset: -5, status: 'completed', notes: 'Vaccination' },
        { petIdx: 3, offset: -2, status: 'completed', notes: 'Dental cleaning' },
        { petIdx: 5, offset: -10, status: 'completed', notes: 'Wing clipping' },
        { petIdx: 7, offset: -7, status: 'completed', notes: 'Vaccination' },
      ];

      for (const apt of appointmentDates) {
        const apptDate = new Date();
        apptDate.setDate(apptDate.getDate() + apt.offset);
        
        const { error } = await supabaseAdmin
          .from('appointments')
          .insert({
            pet_id: petIds[apt.petIdx % petIds.length],
            service_id: serviceIds[apt.petIdx % serviceIds.length],
            user_id: petData[apt.petIdx].owner_id,
            appointment_date: apptDate.toISOString().split('T')[0],
            appointment_time: '10:00:00',
            status: apt.status,
            notes: apt.notes,
            price: Math.random() * 200 + 50,
          });

        if (error) {
          console.error('[SEED] Error inserting appointment:', error);
        }
      }
    }

    console.log('[SEED] Seeding completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully',
      stats: {
        usersCreated: users.length,
        petsCreated: petIds.length,
        servicesCreated: serviceIds.length,
      },
    });
  } catch (error) {
    console.error('[SEED] Exception:', error);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
}
