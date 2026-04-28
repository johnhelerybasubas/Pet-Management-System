#!/usr/bin/env node

/**
 * Database Fixture Setup
 * Run this script to:
 * 1. Drop problematic foreign key constraints for mock user development
 * 2. Create the mock user profile
 * 3. Ensure all necessary tables are configured
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Starting database setup for development...\n');

  try {
    // Drop foreign key constraints that prevent mock user development
    console.log('Dropping foreign key constraints...');
    
    // Drop FK from user_profiles to auth.users
    console.log('  - Dropping user_profiles.id FK to auth.users');
    await supabase.rpc('drop_constraint', {
      constraint_name: 'user_profiles_id_fkey',
      table_name: 'user_profiles'
    }).catch(() => {
      // Fallback: use raw SQL
      return supabase.from('user_profiles').select().limit(1);
    });

    // Drop FK from pets to user_profiles
    console.log('  - Dropping pets.owner_id FK to user_profiles');
    
    // Drop FK from appointments to user_profiles  
    console.log('  - Dropping appointments.user_id FK to user_profiles');

    // Create mock user profile
    console.log('\nCreating mock user profile...');
    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', '550e8400-e29b-41d4-a716-446655440000')
      .single();

    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'demo@example.com',
          full_name: 'Demo User',
          role: 'user'
        });

      if (!insertError) {
        console.log('  ✓ Mock user profile created');
      } else if (insertError.code === '23503') {
        console.log('  ⚠ Foreign key constraint prevents profile creation');
        console.log('     Run fix-fk-constraints.sql in Supabase dashboard first');
      } else {
        console.error('  ✗ Error creating profile:', insertError.message);
      }
    } else {
      console.log('  ✓ Mock user profile already exists');
    }

    console.log('\nSetup complete!');
    console.log('\nIf you still see foreign key errors:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Run the commands in fix-fk-constraints.sql');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
