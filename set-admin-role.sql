-- Set a user as admin
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'johnhelery.basubas@gmail.com';

-- Verify the update
SELECT id, email, role FROM user_profiles WHERE email = 'johnhelery.basubas@gmail.com';
