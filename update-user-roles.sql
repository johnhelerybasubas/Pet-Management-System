-- Update user_profiles table to include 'suspended' role
-- Run this in Supabase SQL Editor

-- First, check if the constraint exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_role_check'
    ) THEN
        ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_role_check;
    END IF;
END $$;

-- Add the updated constraint with 'suspended' role
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('user', 'admin', 'suspended'));

-- Verify the update
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'role';
