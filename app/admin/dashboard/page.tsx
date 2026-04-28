'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import AdminStats from '@/app/admin/components/AdminStats';
import UserPetManagement from '@/app/admin/components/UserPetManagement';
import BookingManagement from '@/app/admin/components/BookingManagement';

type AdminTab = 'overview' | 'users-pets' | 'bookings';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      router.push('/admin-login');
    }
  };

  const sidebarItems = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'users-pets' as AdminTab, label: 'Users & Pets', icon: User },
    { id: 'bookings' as AdminTab, label: 'Bookings', icon: CalendarCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-40 md:z-20`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">PawHeleryCare</h1>
                <p className="text-xs text-slate-400">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${!isMobile && (sidebarOpen ? 'ml-64' : 'ml-20')}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
              </button>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 capitalize">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {activeTab === 'overview' && <AdminStats onNavigate={setActiveTab} />}
          {activeTab === 'users-pets' && <UserPetManagement />}
          {activeTab === 'bookings' && <BookingManagement />}
        </div>
      </main>
    </div>
  );
}
