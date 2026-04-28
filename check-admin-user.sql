-- Check if your admin user exists and has the correct role
-- Run this in Supabase SQL Editor

-- Check if the user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'johnhelery.basubas@gmail.com';

-- Check if the user has a profile with admin role
SELECT id, email, full_name, role, created_at FROM user_profiles WHERE email = 'johnhelery.basubas@gmail.com';

-- If the profile doesn't exist or role is not 'admin', run this to fix it:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'johnhelery.basubas@gmail.com';
