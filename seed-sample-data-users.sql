-- Step 2: Insert sample users (run this after step 1)
INSERT INTO user_profiles (id, email, full_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com', 'John Doe', 'user'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com', 'Jane Smith', 'user'),
  ('550e8400-e29b-41d4-a716-446655440003', 'user3@example.com', 'Bob Johnson', 'user'),
  ('550e8400-e29b-41d4-a716-446655440004', 'user4@example.com', 'Alice Williams', 'user'),
  ('550e8400-e29b-41d4-a716-446655440005', 'user5@example.com', 'Charlie Brown', 'user')
ON CONFLICT (id) DO NOTHING;
