import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log configuration for debugging
if (typeof window === 'undefined') {
  console.log('Supabase Config:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    anonKey: supabaseAnonKey ? 'SET' : 'MISSING',
    serviceKey: supabaseServiceKey ? 'SET' : 'MISSING',
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for server-side operations (bypasses RLS)
// Only create if service key is available
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createClient(supabaseUrl, supabaseAnonKey); // Fallback to anon key if service key not available

// Session cache to prevent race conditions from concurrent getSession() calls
let sessionCache: any = null;
let sessionCacheTime = 0;
const SESSION_CACHE_DURATION = 10000; // 10 seconds

export async function getCachedSession() {
  const now = Date.now();
  
  // Return cached session if still valid
  if (sessionCache && now - sessionCacheTime < SESSION_CACHE_DURATION) {
    return sessionCache;
  }

  try {
    // Try to fetch session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      sessionCache = session;
      sessionCacheTime = now;
      return session;
    }

    // If no Supabase session, check for mock auth token in localStorage (development)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        // Create a mock session object for mock auth
        const mockSession = {
          access_token: 'mock-token-' + Date.now(),
          user: JSON.parse(storedUser),
        };
        sessionCache = mockSession;
        sessionCacheTime = now;
        return mockSession;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching session:', error);
    // If there's an error, try fallback to localStorage mock auth
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const mockSession = {
          access_token: 'mock-token-' + Date.now(),
          user: JSON.parse(storedUser),
        };
        sessionCache = mockSession;
        sessionCacheTime = now;
        return mockSession;
      }
    }
    // If there's an error and no fallback, clear cache
    sessionCache = null;
    sessionCacheTime = 0;
    return null;
  }
}

// Clear session cache (call on logout)
export function clearSessionCache() {
  sessionCache = null;
  sessionCacheTime = 0;
}
