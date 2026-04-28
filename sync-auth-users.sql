-- Sync auth.users with user_profiles
-- Run this in Supabase SQL Editor to create profiles for existing auth users

-- Insert user_profiles for any auth users that don't have one
INSERT INTO user_profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'user' as role
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Verify the sync
SELECT 
  au.id,
  au.email,
  up.full_name,
  up.role,
  CASE WHEN up.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id;
