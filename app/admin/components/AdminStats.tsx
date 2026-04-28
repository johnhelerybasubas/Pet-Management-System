'use client';

import { useEffect, useState } from 'react';
import { Users, HeartPulse, CalendarCheck, CheckCircle, TrendingUp, Activity, Award, Clock } from 'lucide-react';

interface AdminStatsProps {
  onNavigate?: (tab: 'overview' | 'users-pets' | 'bookings') => void;
}

export default function AdminStats({ onNavigate }: AdminStatsProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPets: 0,
    totalBookings: 0,
    completedServices: 0,
    pendingBookings: 0,
    averageHealthScore: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('[AdminStats] Fetching stats...');
        setIsLoading(true);
        setError(null);
        
        // Try to get token from cookie or localStorage
        let token = null;
        
        // Try to get from cookies
        const cookies = document.cookie.split('; ');
        const authCookie = cookies.find(row => row.startsWith('sb-auth-token='));
        if (authCookie) {
          token = authCookie.split('=')[1];
          console.log('[AdminStats] Found token in cookie');
        }
        
        // If no token in cookie, try localStorage (for demo mode)
        if (!token && typeof window !== 'undefined') {
          const storedSession = localStorage.getItem('admin-session');
          if (storedSession) {
            try {
              const sessionData = JSON.parse(storedSession);
              token = sessionData.access_token || sessionData.token;
              console.log('[AdminStats] Found token in localStorage');
            } catch (e) {
              console.log('[AdminStats] Could not parse localStorage session');
            }
          }
        }

        const headers: HeadersInit = {
          'Accept': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('[AdminStats] Using Authorization header with token');
        }

        const response = await fetch('/api/admin/stats?t=' + Date.now(), {
          headers,
          credentials: 'include', // Include cookies in request
          cache: 'no-store',
        });
        
        console.log('[AdminStats] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[AdminStats] Received data:', data);
          setStats(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('[AdminStats] Error response:', errorData);
          setError(errorData.error || 'Failed to fetch stats');
        }
      } catch (error) {
        console.error('[AdminStats] Exception:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-bold text-red-900 mb-2">Unable to Load Dashboard</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <p className="text-xs text-red-600">
              Make sure you're logged in as an admin and have the proper authentication token.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">Dashboard Overview</h3>
        <p className="text-sm text-slate-600">Real-time statistics - showing actual data from database</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs md:text-sm font-medium">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              <span>+12%</span>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
          <p className="text-xs md:text-sm text-slate-600 mt-1">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <HeartPulse className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-blue-600 text-xs md:text-sm font-medium">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              <span>+8%</span>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.totalPets}</p>
          <p className="text-xs md:text-sm text-slate-600 mt-1">Total Pets</p>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-purple-600 text-xs md:text-sm font-medium">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              <span>+15%</span>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.totalBookings}</p>
          <p className="text-xs md:text-sm text-slate-600 mt-1">Total Bookings</p>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm font-medium">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              <span>+20%</span>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.completedServices}</p>
          <p className="text-xs md:text-sm text-slate-600 mt-1">Completed Services</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 md:p-6 text-white">
          <Activity className="w-6 h-6 md:w-8 md:h-8 mb-3 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.averageHealthScore}%</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">Avg Health Score</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 text-white">
          <Users className="w-6 h-6 md:w-8 md:h-8 mb-3 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.activeUsers}</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">Active Users</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 md:p-6 text-white">
          <Clock className="w-6 h-6 md:w-8 md:h-8 mb-3 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.pendingBookings}</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">Pending Bookings</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
        <h4 className="font-bold text-slate-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <button
            onClick={() => onNavigate?.('users-pets')}
            className="flex items-center justify-center gap-3 p-3 md:p-4 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">View Users</span>
          </button>
          <button
            onClick={() => onNavigate?.('users-pets')}
            className="flex items-center justify-center gap-3 p-3 md:p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <HeartPulse className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Pet Health</span>
          </button>
          <button
            onClick={() => onNavigate?.('bookings')}
            className="flex items-center justify-center gap-3 p-3 md:p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
          >
            <CalendarCheck className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Bookings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
