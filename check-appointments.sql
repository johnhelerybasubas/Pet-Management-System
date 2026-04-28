-- Check appointments table
-- Run this in Supabase SQL Editor

-- 1. Check if appointments table exists and has data
SELECT * FROM appointments;

-- 2. Check if there are any pets
SELECT id, name, owner_id FROM pets LIMIT 5;

-- 3. Check if there are any services
SELECT id, name, category FROM services LIMIT 5;

-- 4. Check if there are any users
SELECT id, full_name FROM user_profiles LIMIT 5;

-- 5. Create a sample appointment if tables have data but no appointments
-- Uncomment and run this if you want to add sample data
/*
INSERT INTO appointments (pet_id, service_id, user_id, appointment_date, appointment_time, status, notes)
SELECT 
  (SELECT id FROM pets LIMIT 1),
  (SELECT id FROM services LIMIT 1),
  (SELECT id FROM user_profiles LIMIT 1),
  CURRENT_DATE + INTERVAL '2 days',
  '10:00:00',
  'scheduled',
  'Sample appointment'
ON CONFLICT DO NOTHING;
*/
