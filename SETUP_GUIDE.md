# Quick Setup Guide for Authentication & Overview

## Step 1: Create .env.local File

Create a file named `.env.local` in the project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to get these:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the values and paste them above

## Step 2: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content of `database.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run**

## Step 3: Create Admin User

### Option A: Create new admin user
1. Run this SQL in Supabase SQL Editor (replace with your email):
```sql
-- First, sign up via the app at /signup
-- Then run this to make them admin:
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### Option B: Use existing user
Run `set-admin-role.sql` in Supabase SQL Editor after updating the email.

## Step 4: Test the Setup

1. Start the dev server:
```bash
npm run dev
```

2. Go to http://localhost:3000
3. Login with your admin credentials
4. Navigate to the admin dashboard
5. The overview should now show real data from Supabase

## Troubleshooting

**"Connection refused"** - Check .env.local has correct Supabase URL and keys

**"Unauthorized"** - Make sure your user has admin role in user_profiles table

**Stats showing 0** - Verify database schema was run and tables have data

**Cookie errors** - Clear browser cookies and try logging in again
