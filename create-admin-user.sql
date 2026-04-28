-- Create admin user for PawHeleryCare
-- This single query automatically finds the UUID and sets admin role
-- Just copy and paste this entire block into Supabase SQL Editor and run it:

WITH user_uuid AS (
  SELECT id FROM auth.users WHERE email = 'johnhelery.basubas@gmail.com'
)
UPDATE user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM user_uuid);

-- Verify the update:
SELECT id, email, role FROM user_profiles WHERE email = 'johnhelery.basubas@gmail.com';
