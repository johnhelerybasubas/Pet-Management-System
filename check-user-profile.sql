-- Check if user_profiles exist for auth users
-- Run this in Supabase SQL Editor to debug

-- 1. Check all auth users
SELECT id, email, created_at FROM auth.users;

-- 2. Check all user_profiles
SELECT id, email, full_name, role, created_at FROM user_profiles;

-- 3. Find auth users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN up.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id;

-- 4. Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Check if the function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
