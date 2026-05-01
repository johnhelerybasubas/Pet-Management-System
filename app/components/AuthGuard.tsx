'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('AuthGuard: isLoading=', isLoading, 'user=', user);
    // Once loading is complete and there's no user, redirect to login
    if (!isLoading && !user) {
      console.log('AuthGuard: Redirecting to login');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show a visible loading state instead of a blank screen while auth resolves
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600 mx-auto" />
          <p className="text-sm text-slate-600">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600 mx-auto" />
          <p className="text-sm text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Only show children if user is authenticated
  return <>{children}</>;
}
