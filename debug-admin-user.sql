-- Debug script to check admin user status and user_profiles data
-- Run this in Supabase SQL Editor

-- Check all users in user_profiles table
SELECT id, email, role, created_at FROM user_profiles ORDER BY created_at DESC;

-- Check how many users exist
SELECT COUNT(*) as total_users FROM user_profiles;

-- Check how many admins exist
SELECT COUNT(*) as total_admins FROM user_profiles WHERE role = 'admin';

-- Check how many regular users exist
SELECT COUNT(*) as total_regular_users FROM user_profiles WHERE role = 'user';

-- If you need to set a specific user as admin, run this (replace USER_EMAIL with actual email):
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'USER_EMAIL@example.com';

-- Check auth.users table to verify users are registered
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Verify the is_admin function exists and works
SELECT public.is_admin('replace-with-user-id'::uuid) as is_user_admin;
