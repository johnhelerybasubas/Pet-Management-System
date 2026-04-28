'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, MoreVertical } from 'lucide-react';

interface Booking {
  id: string;
  petName: string;
  petType: string;
  owner: string;
  service: string;
  category: 'vet' | 'grooming' | 'boarding' | 'vaccination';
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Booking['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Booking['category']>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/admin/bookings');
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || booking.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusConfig = {
    scheduled: {
      label: 'Scheduled',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Clock,
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
    },
  };

  const categoryIcons = {
    vet: '🏥',
    grooming: '✂️',
    boarding: '🏠',
    vaccination: '💉',
  };

  const petIcons = {
    dog: '🐕',
    cat: '🐱',
    bird: '🦜',
    rabbit: '🐰',
  };

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });

      if (response.ok) {
        setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`/api/admin/bookings?bookingId=${bookingId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setBookings(bookings.filter((b) => b.id !== bookingId));
        } else {
          alert('Failed to delete booking');
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking');
      }
    }
  };

  const statusFlow: Record<Booking['status'], Booking['status'][]> = {
    scheduled: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">Booking Management</h3>
        <p className="text-sm text-slate-600">Manage all service bookings and appointments</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by pet name, owner, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Services</option>
              <option value="vet">Vet</option>
              <option value="grooming">Grooming</option>
              <option value="boarding">Boarding</option>
              <option value="vaccination">Vaccination</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">{bookings.filter((b) => b.status === 'scheduled').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{bookings.filter((b) => b.status === 'completed').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{bookings.filter((b) => b.status === 'cancelled').length}</p>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Pet & Owner</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const StatusIcon = statusConfig[booking.status].icon;
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">
                            {petIcons[booking.petType as keyof typeof petIcons] || '🐾'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{booking.petName}</p>
                            <p className="text-sm text-slate-500">{booking.owner}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{categoryIcons[booking.category]}</span>
                          <div>
                            <p className="font-medium text-slate-900">{booking.service}</p>
                            <p className="text-xs text-slate-500 capitalize">{booking.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">
                            {new Date(booking.date).toLocaleDateString()}
                          </p>
                          <p className="text-slate-500">{booking.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${statusConfig[booking.status].color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[booking.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-600" />
                          </button>
                          {selectedBooking?.id === booking.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 w-48">
                              {statusFlow[booking.status].map((nextStatus) => (
                                <button
                                  key={nextStatus}
                                  onClick={() => {
                                    handleStatusChange(booking.id, nextStatus);
                                    setSelectedBooking(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                >
                                  Mark as {statusConfig[nextStatus].label}
                                </button>
                              ))}
                              <button
                                onClick={() => {
                                  handleDelete(booking.id);
                                  setSelectedBooking(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
