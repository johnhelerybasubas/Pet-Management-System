-- Create users table for storing login credentials
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add RLS (Row Level Security) policy to allow public signup
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view users (for login checks)
CREATE POLICY "Anyone can view users" ON users
  FOR SELECT USING (true);

-- Allow anyone to insert (for signup) - this is needed for anonymous users to create accounts
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own data
CREATE POLICY "Users can delete their own data" ON users
  FOR DELETE USING (auth.uid() = id);
