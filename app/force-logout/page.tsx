'use client';

import { useEffect } from 'react';

export default function ForceLogout() {
  useEffect(() => {
    // Clear all auth data
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    document.cookie = 'sb-auth-token=; path=/; max-age=0; SameSite=Lax';
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600">Logging out...</p>
      </div>
    </div>
  );
}
