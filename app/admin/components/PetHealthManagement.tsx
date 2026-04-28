'use client';

import { useState, useEffect } from 'react';
import { HeartPulse, Search, TrendingUp, TrendingDown, Edit, Save, X } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit';
  breed: string;
  age: number;
  weight: number;
  healthScore: number;
  owner: string;
  vaccinationStatus: 'up-to-date' | 'due' | 'overdue';
  lastCheckup: string;
  activityLevel: 'high' | 'medium' | 'low';
}

export default function PetHealthManagement() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [editFormData, setEditFormData] = useState({
    healthScore: 0,
    vaccinationStatus: 'up-to-date' as Pet['vaccinationStatus'],
    activityLevel: 'high' as Pet['activityLevel'],
  });

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('/api/admin/pets');
        if (response.ok) {
          const data = await response.json();
          setPets(data);
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const petIcons = {
    dog: '🐕',
    cat: '🐱',
    bird: '🦜',
    rabbit: '🐰',
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setEditFormData({
      healthScore: pet.healthScore,
      vaccinationStatus: pet.vaccinationStatus,
      activityLevel: pet.activityLevel,
    });
  };

  const handleSave = () => {
    if (editingPet) {
      setPets(
        pets.map((p) =>
          p.id === editingPet.id
            ? {
                ...p,
                healthScore: editFormData.healthScore,
                vaccinationStatus: editFormData.vaccinationStatus,
                activityLevel: editFormData.activityLevel,
              }
            : p
        )
      );
      setEditingPet(null);
    }
  };

  const averageHealthScore =
    pets.length > 0 ? Math.round(pets.reduce((sum, p) => sum + p.healthScore, 0) / pets.length) : 0;

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
        <h3 className="text-lg font-bold text-slate-900">Pet Health Score Management</h3>
        <p className="text-sm text-slate-600">Monitor and update pet health scores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Pets</p>
          <p className="text-2xl font-bold text-slate-900">{pets.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Avg Health Score</p>
          <p className="text-2xl font-bold text-emerald-600">{averageHealthScore}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Vaccinations Due</p>
          <p className="text-2xl font-bold text-yellow-600">
            {pets.filter((p) => p.vaccinationStatus !== 'up-to-date').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Excellent Health</p>
          <p className="text-2xl font-bold text-green-600">
            {pets.filter((p) => p.healthScore >= 80).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by pet name, owner, or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Pets Grid */}
      <div className="grid gap-4">
        {filteredPets.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No pets found</p>
          </div>
        ) : (
          filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Pet Icon */}
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-3xl">
                    {petIcons[pet.type]}
                  </div>

                  {/* Pet Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-slate-900 text-lg">{pet.name}</h4>
                      <span className="text-sm text-slate-500">{pet.breed}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Owner:</span>
                        <span className="ml-1 font-medium text-slate-900">{pet.owner}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Age:</span>
                        <span className="ml-1 font-medium text-slate-900">{pet.age} years</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Weight:</span>
                        <span className="ml-1 font-medium text-slate-900">{pet.weight} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Last Checkup:</span>
                        <span className="ml-1 font-medium text-slate-900">
                          {new Date(pet.lastCheckup).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health Score & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Health Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getHealthScoreColor(pet.healthScore)} transition-all`}
                          style={{ width: `${pet.healthScore}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-slate-900">{pet.healthScore}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{getHealthScoreLabel(pet.healthScore)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${vaccinationColors[pet.vaccinationStatus]}`}
                    >
                      {pet.vaccinationStatus}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{pet.activityLevel} activity</span>
                  </div>

                  <button
                    onClick={() => handleEdit(pet)}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              {editingPet?.id === pet.id && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h5 className="font-semibold text-slate-900 mb-3">Update Health Information</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Health Score (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editFormData.healthScore}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, healthScore: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Vaccination Status</label>
                      <select
                        value={editFormData.vaccinationStatus}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            vaccinationStatus: e.target.value as Pet['vaccinationStatus'],
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="up-to-date">Up to Date</option>
                        <option value="due">Due</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Activity Level</label>
                      <select
                        value={editFormData.activityLevel}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            activityLevel: e.target.value as Pet['activityLevel'],
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingPet(null)}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
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
    </div>
  );
}
