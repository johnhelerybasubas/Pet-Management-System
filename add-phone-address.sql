-- Migration: Add phone_number and address columns to user_profiles
-- Run this in your Supabase SQL Editor

-- Add phone_number and address columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update the updated_at timestamp to current time
UPDATE user_profiles SET updated_at = NOW() WHERE updated_at IS NOT NULL;
