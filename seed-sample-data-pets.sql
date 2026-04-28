-- Step 3: Insert sample pets (run this after step 2)
INSERT INTO pets (id, owner_id, name, type, breed, age, weight, date_of_birth, health_score) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Max', 'dog', 'Golden Retriever', 3, 25.5, '2021-04-15', 85),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Bella', 'cat', 'Persian', 2, 4.2, '2022-08-20', 90),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Charlie', 'dog', 'Labrador', 4, 30.0, '2020-11-10', 78),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Luna', 'cat', 'Siamese', 1, 3.5, '2023-05-05', 92),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Rocky', 'dog', 'Bulldog', 5, 22.0, '2019-02-28', 75),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'Coco', 'bird', 'Parakeet', 2, 0.1, '2022-03-15', 88),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Daisy', 'rabbit', 'Holland Lop', 1, 2.0, '2023-01-10', 95),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Buddy', 'dog', 'German Shepherd', 3, 32.0, '2021-07-22', 82);
