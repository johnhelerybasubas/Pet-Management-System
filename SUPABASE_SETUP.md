# Supabase Integration Setup Guide for PawCare

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Already installed: `@supabase/supabase-js`

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Enter project details:
   - **Name**: PawCare
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to you
4. Wait for project creation (2-3 minutes)

## Step 2: Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

3. Edit `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 3: Create Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `database.sql` in this project
4. Paste it into the SQL Editor
5. Click "Run"
6. Wait for success message

## Step 4: Update Authentication

The login/signup pages are ready. Current flow:
- User clicks "Continue with Email" on login page
- Supabase handles authentication
- API routes handle session management

## Step 5: Test the Integration

1. Start your dev server: `npm run dev`
2. Go to http://localhost:3000
3. Click "Create an account" on the login page
4. Sign up with email/password
5. You should be redirected to dashboard
6. Navigate to "My Pets" - it will now fetch from Supabase!

## API Routes Ready

All routes are configured and connected to Supabase:

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Data Management
- `GET/POST /api/pets` - Fetch/create pets
- `GET/POST /api/services` - Fetch/create services
- `GET/POST /api/appointments` - Fetch/create appointments
- `GET/POST /api/medical-records` - Fetch/create medical records
- `GET/POST /api/vaccinations` - Fetch/create vaccinations

## Security Features Enabled

✅ Row-Level Security (RLS) - Users only see their own data
✅ Authentication via Supabase Auth
✅ Encrypted passwords
✅ Session management
✅ CORS protected

## Next Steps

1. ✅ Update login page to use `/api/auth/signup` endpoint
2. ✅ Update login page to use `/api/auth/login` endpoint
3. Add user context/state management (Context API or Zustand)
4. Add pet creation flow
5. Add appointment booking integration
6. Add file uploads for pet photos

## Troubleshooting

**"Connection refused"** - Make sure Supabase URL and keys are correct in .env.local

**"Unauthorized"** - Check your RLS policies and make sure user is authenticated

**"Table doesn't exist"** - Run the database.sql schema again in SQL Editor

## Example: Fetching Pets in Component

The components already have the code, but here's the pattern:

```typescript
useEffect(() => {
  const fetchPets = async () => {
    const res = await fetch('/api/pets');
    if (res.ok) {
      const data = await res.json();
      setPets(data);
    }
  };
  fetchPets();
}, []);
```

When you're logged in, Supabase handles the authentication context, and the API returns only YOUR pets!
