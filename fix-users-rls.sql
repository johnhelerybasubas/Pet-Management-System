-- Fix RLS policies for users table
-- Run this in Supabase SQL Editor

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remove old policies if they exist
DROP POLICY IF EXISTS "Anyone can view their own user data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Users can delete their own data" ON users;

-- Create correct policies for app auth flow
CREATE POLICY "Anyone can view users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own data" ON users
  FOR DELETE USING (auth.uid() = id);
