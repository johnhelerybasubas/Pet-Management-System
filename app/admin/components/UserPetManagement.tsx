'use client';

import { useState, useEffect } from 'react';
import { Search, User, HeartPulse, Edit, Save, X, ChevronDown, ChevronUp, Shield, Ban } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit';
  breed: string;
  age: number;
  weight: number;
  healthScore: number;
  vaccinationStatus: 'up-to-date' | 'due' | 'overdue';
  activityLevel: 'high' | 'medium' | 'low';
}

interface UserWithPets {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedDate: string;
  role: string;
  pets: Pet[];
}

export default function UserPetManagement() {
  const [users, setUsers] = useState<UserWithPets[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [editingPet, setEditingPet] = useState<{ userId: string; petId: string; pet: Pet } | null>(null);
  const [editFormData, setEditFormData] = useState({
    healthScore: 0,
    vaccinationStatus: 'up-to-date' as Pet['vaccinationStatus'],
    activityLevel: 'high' as Pet['activityLevel'],
  });

  useEffect(() => {
    const fetchUsersWithPets = async () => {
      try {
        // Get auth token
        const token = localStorage.getItem('auth_token') || 'mock-token-' + Date.now();

        // Fetch users
        const usersResponse = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();

        // Fetch pets
        const petsResponse = await fetch('/api/admin/pets', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!petsResponse.ok) throw new Error('Failed to fetch pets');
        const petsData = await petsResponse.json();

        // Combine users with their pets
        const usersWithPets = usersData.map((user: any) => ({
          ...user,
          pets: petsData.filter((pet: any) => pet.owner === user.name).map((pet: any) => ({
            id: pet.id,
            name: pet.name,
            type: pet.type,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            healthScore: pet.healthScore,
            vaccinationStatus: pet.vaccinationStatus,
            activityLevel: pet.activityLevel,
          })),
        }));

        setUsers(usersWithPets);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersWithPets();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.pets.some((pet) => pet.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleEditPet = (userId: string, pet: Pet) => {
    setEditingPet({ userId, petId: pet.id, pet });
    setEditFormData({
      healthScore: pet.healthScore,
      vaccinationStatus: pet.vaccinationStatus,
      activityLevel: pet.activityLevel,
    });
  };

  const handleSavePet = async () => {
    if (editingPet) {
      try {
        const token = localStorage.getItem('auth_token') || 'mock-token-' + Date.now();
        const response = await fetch('/api/admin/pets', {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            petId: editingPet.petId,
            healthScore: editFormData.healthScore,
            vaccinationStatus: editFormData.vaccinationStatus,
            activityLevel: editFormData.activityLevel,
          }),
        });

        if (response.ok) {
          setUsers(
            users.map((user) =>
              user.id === editingPet.userId
                ? {
                    ...user,
                    pets: user.pets.map((pet) =>
                      pet.id === editingPet.petId
                        ? {
                            ...pet,
                            healthScore: editFormData.healthScore,
                            vaccinationStatus: editFormData.vaccinationStatus,
                            activityLevel: editFormData.activityLevel,
                          }
                        : pet
                    ),
                  }
                : user
            )
          );
          setEditingPet(null);
        } else {
          alert('Failed to update pet');
        }
      } catch (error) {
        console.error('Error updating pet:', error);
        alert('Failed to update pet');
      }
    }
  };

  const handleStatusChange = async (userId: string, newStatus: UserWithPets['status']) => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token-' + Date.now();
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const vaccinationColors = {
    'up-to-date': 'bg-green-100 text-green-700',
    due: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-700',
    suspended: 'bg-red-100 text-red-700',
  };

  const petIcons = {
    dog: '🐕',
    cat: '🐱',
    bird: '🦜',
    rabbit: '🐰',
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
        <h3 className="text-lg font-bold text-slate-900">Users & Pets Management</h3>
        <p className="text-sm text-slate-600">Manage users and their pets in one place</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Pets</p>
          <p className="text-2xl font-bold text-emerald-600">
            {users.reduce((sum, user) => sum + user.pets.length, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Avg Health Score</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.length > 0
              ? Math.round(
                  users.reduce((sum, user) => {
                    const userAvg = user.pets.length > 0
                      ? user.pets.reduce((petSum, pet) => petSum + pet.healthScore, 0) / user.pets.length
                      : 0;
                    return sum + userAvg;
                  }, 0) / users.length
                )
              : 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name, email, or pet name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* User Header */}
              <div className="p-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-slate-900">{user.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[user.status]}`}>
                          {user.status}
                        </span>
                        {user.role === 'admin' && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="text-sm text-slate-500">Pets</p>
                      <p className="text-lg font-bold text-slate-900">{user.pets.length}</p>
                    </div>
                    <button
                      onClick={() => toggleUserExpansion(user.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {expandedUsers.has(user.id) ? (
                        <ChevronUp className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* User Actions */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span className="text-sm text-slate-600">Status:</span>
                <button
                  onClick={() => handleStatusChange(user.id, 'active')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    user.status === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-green-50'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusChange(user.id, 'suspended')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    user.status === 'suspended'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-red-50'
                  }`}
                >
                  Suspended
                </button>
              </div>

              {/* Pets Section */}
              {expandedUsers.has(user.id) && (
                <div className="p-5 space-y-4">
                  {user.pets.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <HeartPulse className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p>No pets registered</p>
                    </div>
                  ) : (
                    user.pets.map((pet) => (
                      <div
                        key={pet.id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl border border-slate-200">
                              {petIcons[pet.type]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold text-slate-900">{pet.name}</h5>
                                <span className="text-sm text-slate-500">{pet.breed}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-slate-500">Age:</span>
                                  <span className="ml-1 font-medium">{pet.age} years</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Weight:</span>
                                  <span className="ml-1 font-medium">{pet.weight} kg</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Activity:</span>
                                  <span className="ml-1 font-medium capitalize">{pet.activityLevel}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className="text-xs text-slate-500 mb-1">Health Score</p>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${getHealthScoreColor(pet.healthScore)}`}
                                    style={{ width: `${pet.healthScore}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-slate-900">{pet.healthScore}%</span>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${vaccinationColors[pet.vaccinationStatus]}`}
                            >
                              {pet.vaccinationStatus}
                            </span>
                            <button
                              onClick={() => handleEditPet(user.id, pet)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                          </div>
                        </div>

                        {/* Edit Form */}
                        {editingPet?.petId === pet.id && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <h6 className="font-semibold text-slate-900 mb-3 text-sm">Update Pet Health</h6>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Health Score (0-100)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={editFormData.healthScore}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, healthScore: parseInt(e.target.value) || 0 })
                                  }
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Vaccination Status</label>
                                <select
                                  value={editFormData.vaccinationStatus}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      vaccinationStatus: e.target.value as Pet['vaccinationStatus'],
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                >
                                  <option value="up-to-date">Up to Date</option>
                                  <option value="due">Due</option>
                                  <option value="overdue">Overdue</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Activity Level</label>
                                <select
                                  value={editFormData.activityLevel}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      activityLevel: e.target.value as Pet['activityLevel'],
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                >
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                  <option value="low">Low</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={handleSavePet}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                              >
                                <Save className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPet(null)}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
