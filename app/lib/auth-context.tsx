'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthCookie = (token: string) => {
    // Cookie is now set by the server API, no need to set client-side
    document.cookie = `sb-auth-token=${token}; path=/; max-age=604800; SameSite=Lax`;
  };

  const clearAuthCookie = () => {
    document.cookie = 'sb-auth-token=; path=/; max-age=0; SameSite=Lax';
  };

  useEffect(() => {
    // Check localStorage for existing session first (for quick load)
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    // Also check Supabase session (source of truth) to ensure cookie/localStorage are in sync
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        if (session.access_token) {
          localStorage.setItem('auth_token', session.access_token);
          localStorage.setItem('auth_refresh_token', session.refresh_token || '');
          setAuthCookie(session.access_token);
        }
      } else if (storedUser && storedToken) {
        // No Supabase session but we have localStorage data - try to restore
        const storedRefreshToken = localStorage.getItem('auth_refresh_token') || '';
        setAuthCookie(storedToken);
        // Note: cookieStorage will automatically provide the token to Supabase
      } else if (!storedUser) {
        // No session and no stored user - clear any stale cookie
        clearAuthCookie();
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        if (session.access_token) {
          localStorage.setItem('auth_token', session.access_token);
          localStorage.setItem('auth_refresh_token', session.refresh_token || '');
          setAuthCookie(session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        clearAuthCookie();
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        // Update stored tokens when refreshed
        localStorage.setItem('auth_token', session.access_token);
        localStorage.setItem('auth_refresh_token', session.refresh_token || '');
        setAuthCookie(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Sign up failed');
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important: include cookies
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Invalid email or password');
    }

    const userData = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.user_metadata?.full_name || result.user.email?.split('@')[0] || 'User',
    };

    localStorage.setItem('auth_user', JSON.stringify(userData));
    
    if (result.session?.access_token) {
      localStorage.setItem('auth_token', result.session.access_token);
      localStorage.setItem('auth_refresh_token', result.session.refresh_token || '');
      // Set the auth cookie for middleware
      setAuthCookie(result.session.access_token);
    }
    setUser(userData);

    // Clear session cache to force refresh
    const { clearSessionCache } = await import('./supabase');
    clearSessionCache();
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out from Supabase:', e);
    }
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    clearAuthCookie();
    setUser(null);
    // Clear session cache
    const { clearSessionCache } = await import('./supabase');
    clearSessionCache();
    // Force redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
