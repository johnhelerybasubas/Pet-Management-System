-- Step 1: Drop FK constraint (run this first)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
