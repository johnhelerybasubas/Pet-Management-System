-- Add RLS policies to allow admin users to bypass restrictions
-- Run this in Supabase SQL Editor

-- Policy for user_profiles: Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for pets: Admins can view all pets
DROP POLICY IF EXISTS "Admins can view all pets" ON pets;
CREATE POLICY "Admins can view all pets" ON pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for appointments: Admins can view all appointments
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for medical_records: Admins can view all records
DROP POLICY IF EXISTS "Admins can view all medical records" ON medical_records;
CREATE POLICY "Admins can view all medical records" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for vaccinations: Admins can view all vaccinations
DROP POLICY IF EXISTS "Admins can view all vaccinations" ON vaccinations;
CREATE POLICY "Admins can view all vaccinations" ON vaccinations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('user_profiles', 'pets', 'appointments', 'medical_records', 'vaccinations')
  AND policyname LIKE '%Admin%';
