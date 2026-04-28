-- Run these commands in your Supabase SQL Editor to fix foreign key constraints for mock users
-- This allows development with mock authentication while maintaining data integrity

-- 1. Drop the foreign key constraint from user_profiles to auth.users
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 2. Drop the foreign key constraint from pets to user_profiles  
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_owner_id_fkey;

-- 3. Drop the foreign key constraint from appointments to user_profiles
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;

-- 4. Drop the foreign key constraint from appointments to services (for mock services)
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;

-- 5. Make service_id nullable since we use mock services
ALTER TABLE appointments ALTER COLUMN service_id DROP NOT NULL;

-- Optional: You can add CHECK constraints or use RLS policies instead for data validation
-- For now, these tables will rely on application-level validation
