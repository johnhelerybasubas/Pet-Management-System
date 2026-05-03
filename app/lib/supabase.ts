import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cookie key that matches our custom auth (used by middleware)
const AUTH_COOKIE_KEY = 'sb-auth-token';

// Cookie storage helper for cross-client auth (sync with middleware)
// This stores the access_token for middleware compatibility
// Full session with refresh_token is stored in localStorage
const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;
    // Supabase auth uses specific keys - we only handle the token storage
    if (key.includes('token') || key.includes('session')) {
      // First check localStorage for full session data
      const storedToken = localStorage.getItem('auth_token');
      const storedRefresh = localStorage.getItem('auth_refresh_token');
      if (storedToken) {
        // Return a minimal session structure that Supabase can work with
        return JSON.stringify({
          access_token: storedToken,
          refresh_token: storedRefresh || '',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: null // Will be populated by Supabase
        });
      }
      // Fallback to cookie
      const match = document.cookie.match(new RegExp('(^| )' + AUTH_COOKIE_KEY + '=([^;]+)'));
      if (match) {
        const token = decodeURIComponent(match[2]);
        return JSON.stringify({
          access_token: token,
          refresh_token: '',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: null
        });
      }
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;
    // Try to parse the session
    try {
      const parsed = JSON.parse(value);
      if (parsed.access_token) {
        // Store access_token in cookie for middleware
        document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(parsed.access_token)}; path=/; max-age=604800; SameSite=Lax`;
        // Store full session in localStorage
        localStorage.setItem('auth_token', parsed.access_token);
        if (parsed.refresh_token) {
          localStorage.setItem('auth_refresh_token', parsed.refresh_token);
        }
        if (parsed.user) {
          localStorage.setItem('auth_user', JSON.stringify(parsed.user));
        }
      }
    } catch {
      // Not JSON, might be a direct token - store in cookie
      document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=604800; SameSite=Lax`;
    }
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Service role client for server-side operations (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    if (typeof window !== 'undefined') {
      // Priority 1: Check cookie directly and decode JWT (most reliable)
      const cookieMatch = document.cookie.match(new RegExp('(^| )sb-auth-token=([^;]+)'));
      if (cookieMatch) {
        const token = decodeURIComponent(cookieMatch[2]);
        try {
          // Decode JWT payload (base64url)
          const parts = token.split('.');
          if (parts.length === 3) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            
            const refreshToken = localStorage.getItem('auth_refresh_token') || '';
            const customSession = {
              access_token: token,
              refresh_token: refreshToken,
              user: {
                id: payload.sub,
                email: payload.email,
                user_metadata: payload.user_metadata || {},
              },
            };
            sessionCache = customSession;
            sessionCacheTime = now;
            // Sync to localStorage for future use
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(customSession.user));
            return customSession;
          }
        } catch (e) {
          console.error('Error decoding JWT token:', e);
        }
      }

      // Priority 2: Check localStorage as fallback
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      const storedRefreshToken = localStorage.getItem('auth_refresh_token');
      
      if (storedUser && storedToken) {
        const customSession = {
          access_token: storedToken,
          refresh_token: storedRefreshToken || '',
          user: JSON.parse(storedUser),
        };
        sessionCache = customSession;
        sessionCacheTime = now;
        return customSession;
      }
    }

    // Priority 3: Try to fetch session from Supabase as last resort
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      sessionCache = session;
      sessionCacheTime = now;
      return session;
    }

    return null;
  } catch (error) {
    console.error('Error fetching session:', error);
    // If there's an error, try fallback to localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      if (storedUser && storedToken) {
        const customSession = {
          access_token: storedToken,
          user: JSON.parse(storedUser),
        };
        sessionCache = customSession;
        sessionCacheTime = now;
        return customSession;
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
