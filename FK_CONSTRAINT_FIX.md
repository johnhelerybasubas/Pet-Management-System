# Foreign Key Constraint Fix for Mock User Development

## Problem
The PawCare app uses mock authentication for development, but the Supabase database has strict foreign key constraints that prevent mock users from creating records:

- `user_profiles.id` references `auth.users(id)` - but mock users don't exist in Supabase auth
- `pets.owner_id` references `user_profiles(id)` - blocks pet creation without valid profile
- `appointments.user_id` references `user_profiles(id)` - blocks appointment creation

This causes the error:
```
"insert or update on table "pets" violates foreign key constraint"
```

## Solution
Drop these foreign key constraints from your Supabase database. The app will still validate data at the application level.

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "+ New Query"

### Step 2: Run the Constraint Removal SQL
Copy and paste this into the SQL editor and click "Run":

```sql
-- Drop the foreign key constraint from user_profiles to auth.users
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Drop the foreign key constraint from pets to user_profiles  
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_owner_id_fkey;

-- Drop the foreign key constraint from appointments to user_profiles
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;
```

### Step 3: Create Mock User Profile (Optional)
After dropping the constraints, you can create the mock user profile:

```sql
INSERT INTO user_profiles (id, email, full_name, role) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@example.com',
  'Demo User',
  'user'
) ON CONFLICT(id) DO NOTHING;
```

### Step 4: Restart Your App
Refresh your browser and try creating a pet again. It should work now!

## Note
These changes are **only for development**. For production, you should:
1. Use real Supabase authentication
2. Keep the foreign key constraints
3. Create proper user accounts through auth sign-up
4. Use Row Level Security (RLS) policies to protect data

## Need Help?
If you still see errors after running the SQL:
- Make sure you're using a Supabase project (not a local database)
- Check that `SUPABASE_SERVICE_ROLE_KEY` is properly configured
- Verify the table names match your database (they should match database.sql)
