'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Mail, Phone, User, Shield, Ban } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  petName?: string;
  petType?: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedDate: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.petName && user.petName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-700',
    suspended: 'bg-red-100 text-red-700',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const petIcons = {
    dog: '🐕',
    cat: '🐱',
    bird: '🦜',
    rabbit: '🐰',
  };

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (response.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This will also delete their pets and account.')) {
      try {
        const response = await fetch(`/api/admin/users?userId=${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUsers(users.filter((u) => u.id !== userId));
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">User Management</h3>
        <p className="text-sm text-slate-600">View and manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or pet name..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-slate-600">{users.filter((u) => u.status === 'inactive').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{users.filter((u) => u.status === 'suspended').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Pet</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.petName ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{petIcons[user.petType as keyof typeof petIcons] || '🐾'}</span>
                          <div>
                            <p className="font-medium text-slate-900">{user.petName}</p>
                            <p className="text-xs text-slate-500 capitalize">{user.petType}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">No pet</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusColors[user.status]}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-600" />
                        </button>
                        {selectedUser?.id === user.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 w-48">
                            {user.status === 'active' && (
                              <button
                                onClick={() => {
                                  handleStatusChange(user.id, 'suspended');
                                  setSelectedUser(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Ban className="w-4 h-4" />
                                Suspend
                              </button>
                            )}
                            {user.status === 'suspended' && (
                              <button
                                onClick={() => {
                                  handleStatusChange(user.id, 'active');
                                  setSelectedUser(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleDelete(user.id);
                                setSelectedUser(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <User className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
