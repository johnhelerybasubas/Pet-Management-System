-- Seed test users (Run this after creating the users table)
-- Replace 'password123' and 'demo123' with hashed passwords in production

INSERT INTO users (email, password, full_name) VALUES
  ('test@example.com', 'password123', 'Test User'),
  ('demo@example.com', 'demo123', 'Demo User'),
  ('john@example.com', 'john123', 'John Doe'),
  ('jane@example.com', 'jane123', 'Jane Smith')
ON CONFLICT (email) DO NOTHING;

-- Verify the data was inserted
SELECT id, email, full_name, created_at FROM users;
