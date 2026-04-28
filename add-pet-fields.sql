-- Add vaccination_status and activity_level columns to pets table
ALTER TABLE pets
ADD COLUMN IF NOT EXISTS vaccination_status TEXT DEFAULT 'up-to-date' CHECK (vaccination_status IN ('up-to-date', 'due', 'overdue')),
ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'medium' CHECK (activity_level IN ('high', 'medium', 'low'));
