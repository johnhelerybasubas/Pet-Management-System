-- Step 4: Insert sample appointments (run this after step 3)
INSERT INTO appointments (id, pet_id, service_id, user_id, appointment_date, appointment_time, status, notes)
SELECT 
  gen_random_uuid(),
  p.id,
  (SELECT id FROM services LIMIT 1),
  p.owner_id,
  CASE 
    WHEN p.name = 'Max' THEN CURRENT_DATE + INTERVAL '1 day'
    WHEN p.name = 'Charlie' THEN CURRENT_DATE + INTERVAL '3 days'
    WHEN p.name = 'Rocky' THEN CURRENT_DATE + INTERVAL '5 days'
    WHEN p.name = 'Daisy' THEN CURRENT_DATE + INTERVAL '2 days'
    WHEN p.name = 'Bella' THEN CURRENT_DATE - INTERVAL '5 days'
    WHEN p.name = 'Luna' THEN CURRENT_DATE - INTERVAL '2 days'
    WHEN p.name = 'Coco' THEN CURRENT_DATE - INTERVAL '10 days'
    WHEN p.name = 'Buddy' THEN CURRENT_DATE - INTERVAL '7 days'
  END,
  CASE 
    WHEN p.name = 'Max' THEN '10:00:00'::time
    WHEN p.name = 'Charlie' THEN '09:00:00'::time
    WHEN p.name = 'Rocky' THEN '15:00:00'::time
    WHEN p.name = 'Daisy' THEN '16:00:00'::time
    WHEN p.name = 'Bella' THEN '14:00:00'::time
    WHEN p.name = 'Luna' THEN '11:30:00'::time
    WHEN p.name = 'Coco' THEN '10:00:00'::time
    WHEN p.name = 'Buddy' THEN '13:00:00'::time
  END,
  CASE 
    WHEN p.name IN ('Max', 'Charlie', 'Rocky', 'Daisy') THEN 'scheduled'
    ELSE 'completed'
  END,
  CASE 
    WHEN p.name = 'Max' THEN 'Annual checkup'
    WHEN p.name = 'Charlie' THEN 'Grooming session'
    WHEN p.name = 'Rocky' THEN 'Health checkup'
    WHEN p.name = 'Daisy' THEN 'Nail trimming'
    WHEN p.name = 'Bella' THEN 'Vaccination'
    WHEN p.name = 'Luna' THEN 'Dental cleaning'
    WHEN p.name = 'Coco' THEN 'Wing clipping'
    WHEN p.name = 'Buddy' THEN 'Vaccination'
  END
FROM pets p
WHERE p.name IN ('Max', 'Bella', 'Charlie', 'Luna', 'Rocky', 'Coco', 'Daisy', 'Buddy');
