'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconHeart, IconCalendar, IconBell, IconZap, IconUsers, IconActivity, IconMapPin, IconShoppingCart } from '@/app/lib/icons';
import { usePets } from '@/app/lib/pet-context';
import { getCachedSession } from '@/app/lib/supabase';
import { useAuth } from '@/app/lib/auth-context';

interface Appointment {
  id: string;
  pet_id: string;
  appointment_date: string;
  appointment_time: string;
  type?: string;
  provider?: string;
  status: string;
  pets?: { name: string; type: string };
  services?: { name: string; category: string };
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info';
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { pets, isLoading: petsLoading } = usePets();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get session using centralized function with proper fallbacks
        const session = await getCachedSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
          console.error('No access token found, redirecting to login');
          router.push('/login');
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        };

        // Fetch appointments
        const appointmentsResponse = await fetch('/api/appointments', { headers });
        if (!appointmentsResponse.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData || []);

        // Generate reminders based on appointments and pets
        const generatedReminders: Reminder[] = [];
        if (appointmentsData && appointmentsData.length > 0) {
          generatedReminders.push({
            id: '1',
            title: `You have ${appointmentsData.length} upcoming appointment(s)`,
            description: 'Check your calendar for scheduled services',
            type: 'info',
          });
        }

        const overdueVaccinations = pets?.filter((pet) => pet.health_score < 70) || [];
        if (overdueVaccinations.length > 0) {
          generatedReminders.push({
            id: '2',
            title: `Health Alert for ${overdueVaccinations[0]?.name}`,
            description: 'Schedule a vet checkup to improve health',
            type: 'warning',
          });
        }

        setReminders(generatedReminders.length > 0 ? generatedReminders : [
          {
            id: '1',
            title: 'No upcoming reminders',
            description: 'You are all caught up!',
            type: 'info',
          },
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch data when auth is loaded and user is authenticated
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      // Auth loaded but no user - redirect to login
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Get the appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning!';
    } else if (hour < 18) {
      return 'Good afternoon!';
    } else {
      return 'Good evening!';
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      setCancelling(appointmentId);
      
      // Get session using centralized function
      const session = await getCachedSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel appointment');
      }

      // Remove from local state
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel appointment';
      setError(errorMessage);
    } finally {
      setCancelling(null);
    }
  };

  const statsData = [
    { label: 'My Pets', value: pets.length.toString(), icon: IconUsers },
    { label: 'Upcoming', value: appointments.length.toString(), icon: IconCalendar },
    { label: 'Appointments', value: appointments.filter(a => a.status === 'scheduled').length.toString(), icon: IconActivity },
    { label: 'Health Score', value: pets.length > 0 ? Math.round(pets.reduce((sum, p) => sum + (p.health_score || 0), 0) / pets.length) + '%' : '0%', icon: IconHeart },
  ];

  // Get pet by ID
  const getPetById = (petId: string) => pets.find(p => p.id === petId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-8 mt-4 mb-4">
          {error}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-400 to-cyan-300 px-4 md:px-8 py-6 md:py-8 rounded-2xl mx-4 md:mx-8 mt-4 md:mt-6 mb-6 md:mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald-700 text-xs md:text-sm font-medium mb-1">
              📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3">
              {getGreeting()}
            </h1>
            <p className="text-emerald-700 text-sm md:text-base">
              You have {reminders.length} {reminders.length === 1 ? 'reminder' : 'reminders'} and {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}.
            </p>
          </div>
          <div className="text-4xl md:text-6xl">🐾</div>
        </div>
      </div>

      <div className="px-4 md:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-xs md:text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Left Column - Pets and Appointments */}
          <div className="col-span-1 md:col-span-2">
            {/* My Pets Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">My Pets</h2>
                <a href="/pets" className="text-teal-600 text-sm font-medium hover:text-teal-700">
                  View all
                </a>
              </div>
              {pets.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <p className="text-slate-500">No pets added yet. Add your first pet to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {pets.slice(0, 4).map((pet) => (
                    <div
                      key={pet.id}
                      onClick={() => router.push(`/pets`)}
                      className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                    >
                      {pet.image_url && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img
                            src={pet.image_url}
                            alt={pet.name}
                            className="w-full h-24 md:h-32 object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-900 text-sm md:text-base">{pet.name}</h3>
                        <span className="text-xl md:text-2xl">
                          {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐱' : '🦜'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs md:text-sm mb-3">{pet.breed}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-600 text-xs font-semibold px-2 py-1 bg-emerald-50 rounded-full">
                          {pet.age} yrs
                        </span>
                        <span className="text-xs md:text-sm font-semibold text-slate-900">{pet.weight} kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Appointments Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
                <button onClick={() => router.push('/booking')} className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors">
                  Book new
                </button>
              </div>
              {appointments.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 md:p-8 text-center border border-slate-200">
                  <p className="text-slate-500 text-sm md:text-base">No appointments scheduled. Book one to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((apt) => {
                    const pet = getPetById(apt.pet_id);
                    const categoryColors: Record<string, string> = {
                      'vet': 'bg-teal-50 border-teal-200',
                      'grooming': 'bg-blue-50 border-blue-200',
                      'vaccination': 'bg-purple-50 border-purple-200',
                      'training': 'bg-orange-50 border-orange-200',
                    };
                    const category = apt.services?.category || 'vet';
                    const colorClass = categoryColors[category] || 'bg-slate-50 border-slate-200';

                    return (
                      <div
                        key={apt.id}
                        onClick={() => router.push(`/booking`)}
                        className={`bg-white rounded-xl p-3 md:p-4 border ${colorClass} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:shadow-md transition-shadow cursor-pointer`}
                      >
                        <div className="flex items-center gap-3 md:gap-4 flex-1 w-full">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                            {pet?.image_url ? (
                              <img
                                src={pet.image_url}
                                alt={pet?.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              pet?.type === 'dog' ? '🐕' : pet?.type === 'cat' ? '🐱' : '🦜'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm md:text-base truncate">
                              {apt.services?.name || apt.type || 'Appointment'}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-600 truncate">{pet?.name || 'Unknown pet'}</p>
                            <p className="text-xs text-slate-500 mt-1">📅 {new Date(apt.appointment_date).toLocaleDateString()} • 🕐 {apt.appointment_time}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/booking`); }} className="flex-1 sm:flex-none bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold hover:bg-emerald-700 transition-colors">
                            View
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              handleCancelAppointment(apt.id);
                            }}
                            disabled={cancelling === apt.id}
                            className="flex-1 sm:flex-none bg-red-600 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold hover:bg-red-700 transition-colors disabled:bg-red-400"
                          >
                            {cancelling === apt.id ? '✕...' : '✕'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Reminders and Health Overview */}
          <div className="space-y-4 md:space-y-6">
            {/* Reminders Section */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <IconBell className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  Reminders
                </h2>
              </div>
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      reminder.type === 'warning'
                        ? 'bg-orange-50 border-orange-400'
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <p className="font-medium text-xs md:text-sm text-slate-900">{reminder.title}</p>
                    <p className="text-[10px] md:text-xs text-slate-600 mt-1">{reminder.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Overview */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-bold text-slate-900">Health Overview</h2>
                <a href="/pets" className="text-slate-400 hover:text-slate-600">
                  →
                </a>
              </div>
              <div className="space-y-3 md:space-y-4">
                {pets.slice(0, 4).map((pet) => (
                  <div key={pet.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm overflow-hidden">
                        {pet.image_url ? (
                          <img
                            src={pet.image_url}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          pet.type === 'dog' ? '🐕' : '🐱'
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-slate-900">{pet.name}</span>
                    </div>
                    <div className="w-20 md:w-24">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${pet.health_score || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] md:text-xs font-semibold text-slate-600 w-8 md:w-10 text-right">
                          {pet.health_score || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {pets.length === 0 && (
                  <p className="text-slate-500 text-xs md:text-sm text-center py-4">No pets to display</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div
              onClick={() => router.push('/booking')}
              className="bg-emerald-50 text-emerald-600 rounded-xl p-4 md:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
            >
              <IconZap className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
              <p className="font-semibold text-xs md:text-sm">Book Vet</p>
            </div>
            <div
              onClick={() => router.push('/services')}
              className="bg-blue-50 text-blue-600 rounded-xl p-4 md:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
            >
              <IconShoppingCart className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
              <p className="font-semibold text-xs md:text-sm">Groomer</p>
            </div>
            <div
              onClick={() => router.push('/pets')}
              className="bg-orange-50 text-orange-600 rounded-xl p-4 md:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
            >
              <IconShoppingCart className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
              <p className="font-semibold text-xs md:text-sm">Pets</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
