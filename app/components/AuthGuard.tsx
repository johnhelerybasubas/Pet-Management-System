'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Once loading is complete and there's no user, redirect to login
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show nothing while loading or while redirecting
  if (isLoading || !user) {
    return null;
  }

  // Only show children if user is authenticated
  return <>{children}</>;
}
