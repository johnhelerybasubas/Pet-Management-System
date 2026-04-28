# Authentication Implementation Guide

This guide documents the complete authentication system integrated with Supabase.

## Overview

The authentication system provides:
- User registration (sign up)
- User login
- Session management
- Protected routes
- Automatic redirect for unauthenticated users
- User context throughout the app

## Architecture

### Components

1. **Supabase Client** (`/app/lib/supabase.ts`)
   - Singleton Supabase client
   - Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Exports single instance: `export const supabase = createClient(...)`

2. **Auth Context** (`/app/lib/auth-context.tsx`)
   - React Context for global auth state
   - Provides `useAuth()` hook
   - Manages: user, isLoading, signUp, signIn, signOut
   - Listens to Supabase auth state changes
   - Wraps entire app at root

3. **Middleware** (`/middleware.ts`)
   - Route protection via cookies
   - Redirects unauthenticated users to /login
   - Redirects authenticated users away from /login, /signup, /admin-login
   - Uses cookie-based session detection

4. **Auth Pages**
   - `/app/(auth)/login/page.tsx` - User login
   - `/app/(auth)/signup/page.tsx` - User registration
   - `/app/(auth)/admin-login/page.tsx` - Admin authentication

5. **Protected Routes** (`/app/(app)/`)
   - `/dashboard`
   - `/pets`
   - `/services`
   - `/booking`

### API Routes

```
/api/auth/
  ├── signup     POST - Register new user
  ├── login      POST - Authenticate user
  └── logout     POST - End session

/api/pets       GET/POST - Pet management
/api/services   GET/POST - Service management
/api/appointments  GET/POST - Appointment management
/api/medical-records  GET/POST - Health records
/api/vaccinations  GET/POST - Vaccination tracking
```

## Setup Instructions

### Step 1: Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from Supabase project settings.

### Step 2: Database Schema

Execute `database.sql` in Supabase SQL Editor:

```bash
# Tables created:
- user_profiles (links to auth.users)
- pets
- services
- appointments
- medical_records
- vaccinations
```

### Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
```

Already installed in this project.

### Step 4: Update Layout

Root layout (`/app/layout.tsx`) wraps app with `<AuthProvider>`:

```tsx
import { AuthProvider } from "@/app/lib/auth-context";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### Step 5: Test Authentication

1. Start dev server: `npm run dev`
2. Visit http://localhost:3000
3. Redirects to /login
4. Create new account via /signup
5. Login credentials work across app
6. Access protected routes: /dashboard, /pets, etc.
7. Logout button in navigation sidebar

## Using Authentication

### In Components

```tsx
import { useAuth } from '@/app/lib/auth-context';

export default function MyComponent() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### Auth Context Methods

```tsx
const { user, isLoading, signUp, signIn, signOut } = useAuth();

// Sign up
await signUp('user@example.com', 'password');

// Sign in
await signIn('user@example.com', 'password');

// Sign out
await signOut();

// Current user
console.log(user?.email);
console.log(user?.id);

// Loading state
if (isLoading) return <Spinner />;
```

## How It Works

### Flow: Sign Up

1. User fills signup form
2. Form calls `signUp(email, password)`
3. Auth context calls `/api/auth/signup` endpoint
4. Endpoint calls `supabase.auth.signUp()`
5. Supabase creates user in `auth.users` table
6. Component redirects to `/dashboard`
7. Middleware checks auth token cookie
8. Dashboard loads, user info available via `useAuth()`

### Flow: Login

1. User fills login form
2. Form calls `signIn(email, password)`
3. Auth context calls `/api/auth/login` endpoint
4. Endpoint calls `supabase.auth.signInWithPassword()`
5. Supabase returns session token
6. Auth context updates user state
7. Component redirects to `/dashboard`
8. Middleware validates token
9. Dashboard accessible to authenticated user

### Flow: Route Protection

1. Unauthenticated user visits `/dashboard`
2. Middleware checks for auth token cookie
3. No token found → redirect to `/login`
4. User logs in → token stored in cookies
5. Visit `/dashboard` again
6. Middleware finds token → allow access
7. `useAuth()` hook provides user data

## Features Implemented

✅ User Registration
✅ User Login
✅ User Logout
✅ Session Management (Supabase)
✅ Route Protection
✅ Auth Context (useAuth hook)
✅ Protected API Routes
✅ Real-time Auth State
✅ Error Handling
✅ Loading States

## Features Pending

⏳ Email Verification
⏳ Password Reset
⏳ Two-Factor Authentication (UI ready)
⏳ Social Login (Google)
⏳ Admin Role-Based Access Control
⏳ Profile Completion
⏳ Email Notifications

## Troubleshooting

### "useAuth must be used within AuthProvider"

Make sure the component is inside the layout wrapped with AuthProvider.

### Routes not redirecting

Check that middleware is enabled:
- `middleware.ts` exists in root
- Routes match the middleware patterns

### Cookies not persisting

Ensure Supabase client is initialized correctly with valid credentials in `.env.local`.

### API errors

Verify:
1. Supabase project created
2. Database schema executed (database.sql)
3. Environment variables set correctly
4. Row-Level Security policies not blocking operations

## Testing Checklist

- [ ] Create account at /signup
- [ ] Login at /login
- [ ] Access /dashboard (protected route)
- [ ] View user email in navigation sidebar
- [ ] Logout from navigation
- [ ] Verify redirected to /login
- [ ] Try accessing /dashboard (redirects to /login)
- [ ] Try accessing /login when logged in (redirects to /dashboard)

## Next Steps

1. **Email Verification**: Add email confirmation before allowing login
2. **Password Reset**: Implement forgot password flow
3. **Profile Completion**: Collect user information after signup
4. **Admin Portal**: Use Row-Level Security to restrict admin access
5. **Two-Factor Auth**: Implement TOTP/SMS verification
6. **Social Login**: Add Google/GitHub OAuth

## Files Created/Modified

| File | Purpose |
|------|---------|
| `/app/lib/auth-context.tsx` | Auth state management |
| `/app/lib/supabase.ts` | Supabase client (pre-existing) |
| `/app/(auth)/login/page.tsx` | Login page (updated) |
| `/app/(auth)/signup/page.tsx` | Sign up page (new) |
| `/app/components/Navigation.tsx` | Navigation with logout (updated) |
| `/app/layout.tsx` | Root layout with AuthProvider (updated) |
| `/middleware.ts` | Route protection (new) |
| `/.env.local` | Environment variables (template) |
| `/api/auth/signup` | Sign up endpoint (pre-existing) |
| `/api/auth/login` | Login endpoint (pre-existing) |
| `/api/auth/logout` | Logout endpoint (pre-existing) |

## Key Differences from Standard Auth

This implementation:
- ✅ Uses Supabase's built-in Auth
- ✅ Stores no passwords in database
- ✅ Uses secure HTTP-only cookies
- ✅ Provides global auth context
- ✅ Protects routes via middleware
- ✅ Real-time session updates
- ✅ Works with Row-Level Security

## Related Documentation

- Supabase Auth: https://supabase.com/docs/guides/auth
- Next.js Middleware: https://nextjs.org/docs/advanced-features/middleware
- React Context: https://react.dev/reference/react/createContext
