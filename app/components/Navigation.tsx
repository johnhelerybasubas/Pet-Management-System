'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconHome, IconHeart, IconMapPin, IconCalendar, IconLogOut } from '@/app/lib/icons';
import { useAuth } from '@/app/lib/auth-context';
import { getCachedSession } from '@/app/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

interface UserStats {
  pet_count: number;
  upcoming_appointments: number;
  overdue_vaccinations: number;
  total_notifications: number;
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Fetch user profile and stats on mount and when user changes
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.email) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const session = await getCachedSession();
        if (!session?.access_token) {
          setIsLoadingProfile(false);
          return;
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: IconHome },
    { href: '/pets', label: 'My Pets', icon: IconHeart },
    { href: '/services', label: 'Services', icon: IconMapPin },
    { href: '/booking', label: 'Booking', icon: IconCalendar },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Extract user initials from email
  const getUserInitials = () => {
    if (!user?.email) return 'UK';
    return user.email
      .split('@')[0]
      .split('.')
      .map((part: string) => part[0].toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col min-h-screen fixed left-0 top-0 shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="text-3xl">🐾</span>
          <div>
            <h1 className="text-xl font-bold">PawHeleryCare</h1>
            <p className="text-xs text-slate-400">Pet Management</p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Stats */}
      <div className="p-4 border-t border-slate-700 space-y-3">
        {/* Stats Grid */}
        <div className="px-2 text-xs">
          <div className="bg-slate-700 rounded-lg p-2 text-center">
            <p className="text-slate-400">Pets</p>
            <p className="text-lg font-bold text-teal-400">{stats?.pet_count ?? 0}</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {/* Avatar */}
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-sm">
                {getUserInitials()}
              </div>
            )}
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">{profile?.full_name || user?.email?.split('@')[0]}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <span className="text-slate-400">▼</span>
          </button>

          {/* Settings Menu */}
          {showSettingsMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-700 rounded-lg shadow-lg border border-slate-600 overflow-hidden z-50">
              <Link
                href="/settings"
                onClick={() => setShowSettingsMenu(false)}
                className="block w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              >
                ⚙️ Settings
              </Link>
              <Link
                href="/profile"
                onClick={() => setShowSettingsMenu(false)}
                className="block w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              >
                👤 Profile
              </Link>
              <div className="border-t border-slate-600"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors flex items-center gap-2"
              >
                <IconLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
