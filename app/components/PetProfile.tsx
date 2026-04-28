'use client';

import { useState, useEffect } from 'react';
import { getCachedSession } from '@/app/lib/supabase';
import { usePets } from '@/app/lib/pet-context';
import { IconChevronLeft, IconChevronRight, IconHeart, IconMapPin, IconPill, IconCalendar, IconClock } from '@/app/lib/icons';

interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit';
  breed: string;
  age: number;
  weight: number;
  date_of_birth: string;
  microchip_id: string;
  allergies: string[];
  health_score: number;
  vaccination_status?: 'up-to-date' | 'due' | 'overdue';
  activity_level?: 'high' | 'medium' | 'low';
  image_url?: string;
}

interface Vaccination {
  id: string;
  pet_id: string;
  name: string;
  vaccination_date: string;
  next_due: string;
  provider: string;
  status: 'completed' | 'pending' | 'overdue';
}

interface MedicalRecord {
  id: string;
  pet_id: string;
  record_date: string;
  type: string;
  description: string;
  veterinarian: string;
}

interface Appointment {
  id: string;
  pet_id: string;
  service_id: string;
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  price?: number;
  pets?: { name: string; type: string };
  services?: { name: string; category: string };
}

type TabType = 'overview' | 'medical';

interface NewPetForm {
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit';
  breed: string;
  age: number;
  weight: number;
  date_of_birth: string;
  allergies: string;
  image_url?: string;
}

export default function PetProfile() {
  const { pets, addPet, removePet, refetchPets } = usePets();
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState<NewPetForm>({
    name: '',
    type: 'dog',
    breed: '',
    age: 1,
    weight: 10,
    date_of_birth: '',
    allergies: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const currentPet = pets[currentPetIndex];

  const playSound = (animalType: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;

    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Cat meow sound for all animals
    playTone(800, now, 0.15);
    playTone(600, now + 0.15, 0.1);
    playTone(900, now + 0.3, 0.2);
  };

  const handleEmojiClick = () => {
    setIsSpinning(true);
    if (currentPet) {
      playSound(currentPet.type);
    }
    setTimeout(() => setIsSpinning(false), 1000);
  };

  const refreshMedicalData = async () => {
    try {
      setIsRefreshing(true);
      const session = await getCachedSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      };

      // Fetch vaccinations
      const vacRes = await fetch('/api/vaccinations', { headers });
      if (vacRes.ok) {
        const vacData = await vacRes.json();
        setVaccinations(vacData || []);
      }

      // Fetch medical records
      const medRes = await fetch('/api/medical-records', { headers });
      if (medRes.ok) {
        const medData = await medRes.json();
        setMedicalRecords(medData || []);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get auth session using cache to avoid race conditions
        const session = await getCachedSession();
        
        if (!session) {
          throw new Error('Not authenticated');
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        };

        // Fetch appointments for booking history
        const appRes = await fetch('/api/appointments', { headers });
        if (appRes.ok) {
          const appData = await appRes.json();
          setAppointments(appData || []);
        }

        // Fetch vaccinations
        const vacRes = await fetch('/api/vaccinations', { headers });
        if (vacRes.ok) {
          const vacData = await vacRes.json();
          setVaccinations(vacData || []);
        }

        // Fetch medical records
        const medRes = await fetch('/api/medical-records', { headers });
        if (medRes.ok) {
          const medData = await medRes.json();
          setMedicalRecords(medData || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load pet data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up visibility change listener to refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshMedicalData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const calculateAgeFromBirthDate = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas and compress image
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if larger than 800x800
          const maxSize = 800;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG quality 0.8
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            console.log('Original size:', file.size, 'Compressed base64 size:', compressedBase64.length);
            setImagePreview(compressedBase64);
            setFormData({ ...formData, image_url: compressedBase64 });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read image file');
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const session = await getCachedSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const allergiesArray = formData.allergies
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      const petPayload = {
        name: formData.name,
        type: formData.type,
        breed: formData.breed,
        age: parseInt(formData.age.toString()),
        weight: parseFloat(formData.weight.toString()),
        date_of_birth: formData.date_of_birth,
        allergies: allergiesArray,
        health_score: 80,
        ...(formData.image_url && { image_url: formData.image_url }),
      };

      console.log('Sending pet payload with image:', formData.image_url ? `${formData.image_url.substring(0, 100)}...` : 'no image');

      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(petPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create pet');
      }

      const newPet = await response.json();
      console.log('Pet received from API:', newPet);
      const petToAdd = Array.isArray(newPet) ? newPet[0] : newPet;
      console.log('Pet to add to context - image_url:', petToAdd.image_url ? 'has image' : 'NO IMAGE');
      addPet(petToAdd);
      
      // Refetch pets to ensure dashboard and other components are synced
      await refetchPets();
      
      setShowAddForm(false);
      setImagePreview('');
      setFormData({
        name: '',
        type: 'dog',
        breed: '',
        age: 1,
        weight: 10,
        date_of_birth: '',
        allergies: '',
        image_url: undefined,
      });
    } catch (err) {
      console.error('Error adding pet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add pet. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const session = await getCachedSession();
      if (!session || !session.user) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete pet');
      }

      removePet(petId);
      setCurrentPetIndex(0);
    } catch (err) {
      console.error('Error deleting pet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete pet. Please try again.';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const petAppointments = currentPet ? appointments.filter((a) => a.pet_id === currentPet.id) : [];
  const petVaccinations = currentPet ? vaccinations.filter((v) => v.pet_id === currentPet.id) : [];
  const petMedicalRecords = currentPet ? medicalRecords.filter((r) => r.pet_id === currentPet.id) : [];

  const nextPet = () => {
    if (pets.length > 0) setCurrentPetIndex((prev) => (prev + 1) % pets.length);
  };
  const prevPet = () => {
    if (pets.length > 0) setCurrentPetIndex((prev) => (prev - 1 + pets.length) % pets.length);
  };

  const getVaccinationStatus = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      overdue: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-600">Loading your pets...</p>
          </div>
        </div>
      )}

      {!isLoading && (!pets || pets.length === 0) && !showAddForm && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🐾</div>
            <p className="text-slate-600 text-lg mb-6">No pets found. Add a pet to get started!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Add Your First Pet
            </button>
          </div>
        </div>
      )}

      {!isLoading && showAddForm && (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">Add a New Pet</h1>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddPet} className="space-y-6">
                {/* Name and Type */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Pet Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Max"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Pet Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="rabbit">Rabbit</option>
                    </select>
                  </div>
                </div>

                {/* Pet Picture */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Pet Picture (optional)</label>
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Max file size: 5MB (JPG, PNG, etc.)</p>
                  </div>
                  {imagePreview && (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-teal-300"
                      />
                    </div>
                  )}
                </div>

                {/* Breed */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Breed *</label>
                  <input
                    type="text"
                    required
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Golden Retriever"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Weight (kg) *</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, weight: isNaN(val) ? 0 : val });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., 30"
                  />
                </div>

                {/* Date of Birth and Age Display */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const calculatedAge = calculateAgeFromBirthDate(newDate);
                        setFormData({ ...formData, date_of_birth: newDate, age: calculatedAge });
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Age (years)</label>
                    <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-semibold">
                      {formData.age}
                    </div>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Allergies (optional)</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Separate multiple allergies with commas (e.g., peanuts, chicken)"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setError(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 transition-colors"
                  >
                    {isSubmitting ? 'Adding Pet...' : 'Add Pet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {!isLoading && currentPet && (
        <>
          {/* Hero Section */}
          <div className="relative h-96 bg-gradient-to-br from-teal-400 to-cyan-300 flex items-center justify-center overflow-hidden">
            <style>{`
              @keyframes violentSpin {
                0% { transform: rotate(0deg) scale(1); }
                25% { transform: rotate(90deg) scale(1.1); }
                50% { transform: rotate(180deg) scale(1.2); }
                75% { transform: rotate(270deg) scale(1.1); }
                100% { transform: rotate(360deg) scale(1); }
              }
              .spin-violently {
                animation: violentSpin 1s ease-in-out;
              }
            `}</style>
            <button
              onClick={handleEmojiClick}
              className={`text-8xl transition-transform cursor-pointer focus:outline-none ${isSpinning ? 'spin-violently' : 'animate-bounce'} hover:scale-110`}
            >
              {currentPet.type === 'dog' && '🐕'}
              {currentPet.type === 'cat' && '🐱'}
              {currentPet.type === 'bird' && '🐦'}
              {currentPet.type === 'rabbit' && '🐰'}
            </button>
          </div>

          {/* Pet Navigation */}
          <div className="flex items-center justify-between px-8 -mt-20 mb-8 relative z-10">
            <button
              onClick={prevPet}
              className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <IconChevronLeft className="w-6 h-6 text-slate-900" />
            </button>

            <div className="bg-white rounded-2xl px-8 py-6 shadow-lg flex-1 mx-4">
              <div className="text-center">
                {currentPet.image_url && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={currentPet.image_url}
                      alt={currentPet.name}
                      className="w-40 h-40 object-cover rounded-xl border-4 border-teal-200"
                    />
                  </div>
                )}
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{currentPet.name}</h1>
                <p className="text-slate-600 mb-4">{currentPet.breed}</p>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <span className="font-semibold text-slate-900">🎂 {currentPet.age} years old</span>
                  <span className="font-semibold text-slate-900">⚖️ {currentPet.weight} kg</span>
                  <IconHeart className="w-5 h-5 text-red-500 fill-red-500" />
                </div>
              </div>
            </div>

            <button
              onClick={nextPet}
              className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <IconChevronRight className="w-6 h-6 text-slate-900" />
            </button>
          </div>

          {/* Add/Delete Pet Buttons */}
          <div className="px-8 mb-8 flex justify-end gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              + Add Another Pet
            </button>
            {pets && pets.length > 0 && currentPet && (
              <button
                onClick={() => handleDeletePet(currentPet.id)}
                disabled={isDeleting}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-red-400"
              >
                {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete Pet'}
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="px-8 mb-8">
            <div className="flex gap-2 border-b border-slate-200 items-center justify-between">
              <div className="flex gap-2">
                {(['overview', 'medical'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-semibold transition-colors ${
                      activeTab === tab
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'overview' && 'Overview'}
                    {tab === 'medical' && 'Booking History'}
                  </button>
                ))}
              </div>
              {activeTab === 'medical' && (
                <button
                  onClick={refreshMedicalData}
                  disabled={isRefreshing}
                  className="text-teal-600 hover:text-teal-700 font-semibold transition-colors disabled:opacity-50"
                  title="Refresh data"
                >
                  {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-8 pb-12">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Pet Information</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-slate-600 mb-2">Date of Birth</p>
                    <p className="text-lg font-semibold text-slate-900">{currentPet.date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-2">Weight</p>
                    <p className="text-lg font-semibold text-slate-900">{currentPet.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-2">Health Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${currentPet.health_score}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-900">{currentPet.health_score}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-2">Vaccination Status</p>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      currentPet.vaccination_status === 'up-to-date' ? 'bg-green-100 text-green-700' :
                      currentPet.vaccination_status === 'due' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {currentPet.vaccination_status || 'up-to-date'}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-2">Activity Level</p>
                    <p className="text-lg font-semibold text-slate-900 capitalize">{currentPet.activity_level || 'medium'}</p>
                  </div>
                </div>

                {currentPet.allergies && currentPet.allergies.length > 0 && (
                  <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-900 font-semibold mb-2">⚠️ Allergies</p>
                    <ul className="list-disc list-inside text-orange-800">
                      {currentPet.allergies.map((allergy) => (
                        <li key={allergy}>{allergy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'medical' && (
              <div className="space-y-4">
                {petAppointments.length > 0 ? (
                  petAppointments.map((appointment) => {
                    const statusColors = {
                      scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
                      completed: 'bg-green-100 text-green-800 border-green-300',
                      cancelled: 'bg-red-100 text-red-800 border-red-300',
                    };
                    return (
                      <div
                        key={appointment.id}
                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 mb-2">{appointment.services?.name || 'Service'}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div className="flex items-center gap-2 text-slate-600">
                                <IconCalendar className="w-4 h-4" />
                                {appointment.appointment_date}
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <IconClock className="w-4 h-4" />
                                {appointment.appointment_time}
                              </div>
                            </div>
                            {appointment.notes && (
                              <p className="text-slate-600 text-sm mb-2">{appointment.notes}</p>
                            )}
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColors[appointment.status]}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <p className="text-slate-600">No bookings yet</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}
