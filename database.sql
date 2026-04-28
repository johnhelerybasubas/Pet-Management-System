-- Supabase Database Schema for PawCare
-- Run these SQL commands in your Supabase SQL Editor

-- Users table (handled by Supabase Auth, but add profile)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dog', 'cat', 'bird', 'rabbit')),
  breed TEXT NOT NULL,
  age INT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  date_of_birth DATE NOT NULL,
  microchip_id TEXT UNIQUE,
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  health_score INT DEFAULT 80 CHECK (health_score >= 0 AND health_score <= 100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vet', 'grooming', 'training', 'boarding')),
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INT DEFAULT 0,
  hours TEXT,
  coordinates JSONB DEFAULT NULL,
  image_url TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  provider_id UUID,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  veterinarian TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vaccination_date DATE NOT NULL,
  next_due DATE,
  provider TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Insert sample services
INSERT INTO services (name, category, address, phone, rating, reviews, hours, coordinates) VALUES
  ('Happy Paws Veterinary Clinic', 'vet', '123 Montessori Street, Butuan City, Agusan del Norte 8100', '(085) 225-0000', 4.8, 245, '9:00 AM - 6:00 PM', '{"lat": 8.9746, "lng": 125.5308}'),
  ('Paws & Claws Grooming Salon', 'grooming', '456 Corrales Avenue, Butuan City, Agusan del Norte 8100', '(085) 225-1111', 4.6, 189, '10:00 AM - 7:00 PM', '{"lat": 8.9765, "lng": 125.5298}'),
  ('Bark Academy Dog Training', 'training', '789 Dahican Road, Butuan City, Agusan del Norte 8100', '(085) 225-2222', 4.9, 156, '8:00 AM - 5:00 PM', '{"lat": 8.9730, "lng": 125.5320}'),
  ('Cozy Pets Boarding House', 'boarding', '321 Bangkal Road, Butuan City, Agusan del Norte 8100', '(085) 225-3333', 4.7, 203, '24/7', '{"lat": 8.9700, "lng": 125.5280}'),
  ('Pet Wellness Center', 'vet', '654 Ayala Heights, Butuan City, Agusan del Norte 8100', '(085) 225-4444', 4.7, 178, '9:00 AM - 7:00 PM', '{"lat": 8.9720, "lng": 125.5340}'),
  ('Fur Fest Grooming & Spa', 'grooming', '987 Libertad Street, Butuan City, Agusan del Norte 8100', '(085) 225-5555', 4.8, 201, '9:00 AM - 6:00 PM', '{"lat": 8.9750, "lng": 125.5310}');


-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for pets
DROP POLICY IF EXISTS "Users can view their own pets" ON pets;
DROP POLICY IF EXISTS "Users can create pets" ON pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON pets;
CREATE POLICY "Users can view their own pets" ON pets
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pets" ON pets
  FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policies for appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for medical_records
DROP POLICY IF EXISTS "Users can view their own pet medical records" ON medical_records;
CREATE POLICY "Users can view their own pet medical records" ON medical_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.owner_id = auth.uid())
  );

-- RLS Policies for vaccinations
DROP POLICY IF EXISTS "Users can view their own pet vaccinations" ON vaccinations;
CREATE POLICY "Users can view their own pet vaccinations" ON vaccinations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_id AND pets.owner_id = auth.uid())
  );

-- Public access for services (anyone can read)
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
