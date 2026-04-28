-- Fix infinite recursion in RLS policies
-- This removes the problematic recursive policies and replaces them with non-recursive alternatives

-- First, drop the recursive policies that check role by querying user_profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all pets" ON pets;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all medical records" ON medical_records;
DROP POLICY IF EXISTS "Admins can view all vaccinations" ON vaccinations;

-- Create a SECURITY DEFINER function to safely check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the user_profiles policies with the helper function
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    public.is_admin(auth.uid())
  );

-- Recreate the pets policies with the helper function
CREATE POLICY "Admins can view all pets" ON pets
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update all pets" ON pets
  FOR UPDATE USING (
    public.is_admin(auth.uid())
  );

-- Recreate the appointments policies with the helper function
CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update all appointments" ON appointments
  FOR UPDATE USING (
    public.is_admin(auth.uid())
  );

-- Recreate the medical_records policies with the helper function
CREATE POLICY "Admins can view all medical records" ON medical_records
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- Recreate the vaccinations policies with the helper function
CREATE POLICY "Admins can view all vaccinations" ON vaccinations
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('user_profiles', 'pets', 'appointments', 'medical_records', 'vaccinations')
ORDER BY tablename, policyname;
