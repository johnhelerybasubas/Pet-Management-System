-- Seed sample data for testing the admin dashboard
-- Run this in Supabase SQL Editor

-- Temporarily drop FK constraint for user_profiles to allow test data
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Insert sample users (if they don't exist)
INSERT INTO user_profiles (id, email, full_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com', 'John Doe', 'user'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com', 'Jane Smith', 'user'),
  ('550e8400-e29b-41d4-a716-446655440003', 'user3@example.com', 'Bob Johnson', 'user'),
  ('550e8400-e29b-41d4-a716-446655440004', 'user4@example.com', 'Alice Williams', 'user'),
  ('550e8400-e29b-41d4-a716-446655440005', 'user5@example.com', 'Charlie Brown', 'user')
ON CONFLICT (id) DO NOTHING;

-- Insert sample pets
INSERT INTO pets (id, owner_id, name, type, breed, age, weight, date_of_birth, health_score) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Max', 'dog', 'Golden Retriever', 3, 25.5, '2021-04-15', 85),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Bella', 'cat', 'Persian', 2, 4.2, '2022-08-20', 90),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Charlie', 'dog', 'Labrador', 4, 30.0, '2020-11-10', 78),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Luna', 'cat', 'Siamese', 1, 3.5, '2023-05-05', 92),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Rocky', 'dog', 'Bulldog', 5, 22.0, '2019-02-28', 75),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'Coco', 'bird', 'Parakeet', 2, 0.1, '2022-03-15', 88),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Daisy', 'rabbit', 'Holland Lop', 1, 2.0, '2023-01-10', 95),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Buddy', 'dog', 'German Shepherd', 3, 32.0, '2021-07-22', 82);

-- Insert sample appointments
INSERT INTO appointments (id, pet_id, service_id, user_id, appointment_date, appointment_time, status, notes)
SELECT 
  gen_random_uuid(),
  p.id,
  (SELECT id FROM services LIMIT 1),
  p.owner_id,
  CASE 
    WHEN p.name = 'Max' THEN CURRENT_DATE + INTERVAL '1 day'
    WHEN p.name = 'Charlie' THEN CURRENT_DATE + INTERVAL '3 days'
    WHEN p.name = 'Rocky' THEN CURRENT_DATE + INTERVAL '5 days'
    WHEN p.name = 'Daisy' THEN CURRENT_DATE + INTERVAL '2 days'
    WHEN p.name = 'Bella' THEN CURRENT_DATE - INTERVAL '5 days'
    WHEN p.name = 'Luna' THEN CURRENT_DATE - INTERVAL '2 days'
    WHEN p.name = 'Coco' THEN CURRENT_DATE - INTERVAL '10 days'
    WHEN p.name = 'Buddy' THEN CURRENT_DATE - INTERVAL '7 days'
  END,
  CASE 
    WHEN p.name = 'Max' THEN '10:00:00'::time
    WHEN p.name = 'Charlie' THEN '09:00:00'::time
    WHEN p.name = 'Rocky' THEN '15:00:00'::time
    WHEN p.name = 'Daisy' THEN '16:00:00'::time
    WHEN p.name = 'Bella' THEN '14:00:00'::time
    WHEN p.name = 'Luna' THEN '11:30:00'::time
    WHEN p.name = 'Coco' THEN '10:00:00'::time
    WHEN p.name = 'Buddy' THEN '13:00:00'::time
  END,
  CASE 
    WHEN p.name IN ('Max', 'Charlie', 'Rocky', 'Daisy') THEN 'scheduled'
    ELSE 'completed'
  END,
  CASE 
    WHEN p.name = 'Max' THEN 'Annual checkup'
    WHEN p.name = 'Charlie' THEN 'Grooming session'
    WHEN p.name = 'Rocky' THEN 'Health checkup'
    WHEN p.name = 'Daisy' THEN 'Nail trimming'
    WHEN p.name = 'Bella' THEN 'Vaccination'
    WHEN p.name = 'Luna' THEN 'Dental cleaning'
    WHEN p.name = 'Coco' THEN 'Wing clipping'
    WHEN p.name = 'Buddy' THEN 'Vaccination'
  END
FROM pets p
WHERE p.name IN ('Max', 'Bella', 'Charlie', 'Luna', 'Rocky', 'Coco', 'Daisy', 'Buddy');

-- Verify the data was inserted
SELECT 'Users:' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'Pets:', COUNT(*) FROM pets
UNION ALL
SELECT 'Appointments:', COUNT(*) FROM appointments
UNION ALL
SELECT 'Completed Appointments:', COUNT(*) FROM appointments WHERE status = 'completed'
UNION ALL
SELECT 'Scheduled Appointments:', COUNT(*) FROM appointments WHERE status = 'scheduled';

-- Re-add FK constraint (optional - comment out if you want to keep it dropped for development)
-- ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
