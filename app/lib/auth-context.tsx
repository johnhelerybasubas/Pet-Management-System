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
    document.cookie = `sb-auth-token=${token}; path=/; max-age=604800; SameSite=Lax`;
  };

  const clearAuthCookie = () => {
    document.cookie = 'sb-auth-token=; path=/; max-age=0; SameSite=Lax';
  };

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setIsLoading(false);
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
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email or password');
    }

    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
    };

    localStorage.setItem('auth_user', JSON.stringify(userData));
    if (data.session?.access_token) {
      localStorage.setItem('auth_token', data.session.access_token);
      setAuthCookie(data.session.access_token);
    }
    setUser(userData);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    clearAuthCookie();
    setUser(null);
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
