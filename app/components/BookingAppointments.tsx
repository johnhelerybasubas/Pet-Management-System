'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCachedSession } from '@/app/lib/supabase';
import { usePets } from '@/app/lib/pet-context';
import { mockServices } from '@/app/lib/mockData';
import { IconChevronRight, IconChevronLeft, IconCalendar, IconClock, IconUser, IconCheckCircle, IconStar } from '@/app/lib/icons';

type Step = 1 | 2 | 3 | 4;

interface BookingState {
  petId: string;
  serviceId: string;
  date: string;
  time: string;
  providerId: string;
}

interface Service {
  id: string;
  name: string;
  category?: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  hours?: string;
  price?: number;
}

export default function BookingAppointments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceIdFromUrl = searchParams.get('serviceId');
  const { pets, isLoading: petsLoading } = usePets();
  const [step, setStep] = useState<Step>(serviceIdFromUrl ? 1 : 1);
  const [booking, setBooking] = useState<Partial<BookingState>>({
    serviceId: serviceIdFromUrl || undefined,
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service | null>(null);

  const serviceDescriptions: Record<string, string> = {
    'General Checkup': 'Routine health assessment to monitor overall condition and detect issues early. Includes physical examination, weight check, temperature, consultation, and basic health recommendations.',
    'Vaccination Records': 'Complete history of administered vaccines and upcoming schedules. Helps ensure protection against common diseases and keeps immunizations up to date.',
    'Grooming Service': 'Professional cleaning and hygiene care to keep pets healthy and comfortable. Includes bathing, nail trimming, ear cleaning, hair trimming, and coat brushing.',
    'Boarding Service': 'Safe temporary accommodation for pets while owners are away. Includes feeding, supervision, exercise, resting space, and regular care in a secure environment.',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const session = await getCachedSession();
        
        if (!session) {
          setError('Not authenticated');
          setServices(mockServices);
          setIsLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${session.access_token}`,
        };

        // Fetch services from backend
        try {
          const servicesRes = await fetch('/api/services', { headers });
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            setServices(servicesData);
          } else {
            setServices(mockServices);
          }
        } catch (err) {
          console.log('Failed to fetch services, using mock data');
          setServices(mockServices);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedPet = pets.find((p) => p.id === booking.petId);
  const selectedService = services.find((s) => s.id === booking.serviceId);

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const providers = [
    { id: '1', name: 'Dr. Sarah Smith', specialty: 'Veterinarian', rating: 4.8, reviews: 245 },
    { id: '2', name: 'Dr. Mark Johnson', specialty: 'Veterinarian', rating: 4.7, reviews: 189 },
    { id: '3', name: 'Paws & Claws Team', specialty: 'Grooming Experts', rating: 4.6, reviews: 312 },
  ];

  const steps = [
    { number: 1, label: 'Pet & Service', icon: '🐾' },
    { number: 2, label: 'Date & Time', icon: '📅' },
    { number: 3, label: 'Provider', icon: '👨‍⚕️' },
    { number: 4, label: 'Confirm', icon: '✅' },
  ];

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmitBooking = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const session = await getCachedSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      // First, create the appointment
      const appointmentData = {
        pet_id: booking.petId,
        service_id: null, // Service info stored in medical/vaccination records
        appointment_date: booking.date,
        appointment_time: booking.time,
        provider_id: null,
        status: 'scheduled',
        price: 60,
      };

      const appointmentRes = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!appointmentRes.ok) {
        const errorData = await appointmentRes.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      // Then create medical/vaccination records based on service type
      const serviceName = selectedService?.name || '';

      if (serviceName === 'General Checkup' || serviceName === 'Dental Cleaning') {
        const medicalRecord = {
          pet_id: booking.petId,
          record_date: booking.date,
          type: serviceName,
          description: `${serviceName} - Appointment scheduled`,
          veterinarian: 'Dr. Sarah Smith',
        };

        await fetch('/api/medical-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(medicalRecord),
        }).catch(err => console.error('Medical record error:', err));
      }

      if (serviceName === 'Vaccination Records') {
        const appointmentDate = booking.date || '';
        const nextYear = new Date(appointmentDate);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const nextDue = nextYear.toISOString().split('T')[0];

        const vaccineRecord = {
          pet_id: booking.petId,
          name: 'Vaccination',
          vaccination_date: appointmentDate,
          next_due: nextDue,
          provider: 'Dr. Sarah Smith',
          status: 'completed',
        };

        await fetch('/api/vaccinations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(vaccineRecord),
        }).catch(err => console.error('Vaccination record error:', err));
      }

      setShowConfirmation(true);
    } catch (err) {
      console.error('Error creating booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    const serviceName = selectedService?.name || '';
    const willCreateMedicalRecord = serviceName === 'General Checkup' || serviceName === 'Dental Cleaning';
    const willCreateVaccinationRecord = serviceName === 'Vaccination Records';

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-8 shadow-lg max-w-md text-center">
          <div className="text-6xl mb-6 animate-bounce">✅</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-600 mb-6">
            Your appointment with {selectedService?.name} for {selectedPet?.name} has been scheduled.
          </p>
          <div className="bg-teal-50 rounded-xl p-4 mb-6 border border-teal-200">
            <p className="text-sm text-slate-600 mb-1">Appointment Details</p>
            <p className="font-bold text-slate-900 text-lg">
              {booking.date} at {booking.time}
            </p>
          </div>

          {(willCreateMedicalRecord || willCreateVaccinationRecord) && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">📋 Record Created</p>
              <p className="text-sm text-blue-800">
                {willCreateMedicalRecord && 'Medical record has been added to your pet\'s Medical History'}
                {willCreateVaccinationRecord && 'Vaccination record has been added to your pet\'s Vaccination Tracker'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push('/pets')}
              className="w-full bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors"
            >
              View Pet Records
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-slate-200 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-slate-600">Loading booking options...</p>
        </div>
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-slate-600 text-lg">No pets found. Please add a pet first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Service Details Modal */}
      {selectedServiceDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedServiceDetails.name}</h2>
            <p className="text-slate-700 text-sm leading-relaxed mb-6">
              {serviceDescriptions[selectedServiceDetails.name] || selectedServiceDetails.name}
            </p>
            {selectedServiceDetails.price && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-teal-50 rounded-lg">
                <span className="font-semibold text-slate-900">Price:</span>
                <span className="text-lg font-bold text-teal-600">₱{selectedServiceDetails.price}</span>
              </div>
            )}
            {selectedServiceDetails.hours && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg">
                <span>🕐</span>
                <p className="text-sm text-slate-700">{selectedServiceDetails.hours}</p>
              </div>
            )}
            {selectedServiceDetails.rating && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg">
                <span>⭐</span>
                <p className="text-sm text-slate-700">{selectedServiceDetails.rating} ({selectedServiceDetails.reviews} reviews)</p>
              </div>
            )}
            <button
              onClick={() => setSelectedServiceDetails(null)}
              className="w-full mt-4 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="px-8 py-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Book an Appointment</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all ${
                  step >= s.number
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {s.icon}
              </div>
              <p className={`ml-2 font-semibold ${step >= s.number ? 'text-teal-600' : 'text-slate-600'}`}>
                {s.label}
              </p>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded ${
                    step > s.number ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Pet & Service Selection */}
        {step === 1 && (
          <div className={`grid gap-8 ${serviceIdFromUrl ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {/* Pet Selection */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Select Your Pet</h2>
              <div className="space-y-3">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setBooking({ ...booking, petId: pet.id })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      booking.petId === pet.id
                        ? 'bg-teal-50 border-teal-400 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {pet.image_url ? (
                        <img
                          src={pet.image_url}
                          alt={pet.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-3xl">{pet.type === 'dog' ? '🐕' : '🐱'}</span>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{pet.name}</p>
                        <p className="text-sm text-slate-600">{pet.breed}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Selection (only show if not pre-selected from URL) */}
            {!serviceIdFromUrl && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Select Service</h2>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setBooking({ ...booking, serviceId: service.id })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        booking.serviceId === service.id
                          ? 'bg-teal-50 border-teal-400 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{service.name}</p>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedServiceDetails(service);
                          }}
                          className="text-teal-600 hover:text-teal-700 font-semibold text-sm cursor-pointer"
                        >
                          View Details
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Info Card (when pre-selected from URL) */}
            {serviceIdFromUrl && selectedService && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Service Details</h2>
                <div className="bg-teal-50 rounded-xl border-2 border-teal-400 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedService.name}</h3>
                      {selectedService.category && (
                        <p className="text-sm text-slate-600 mb-3 capitalize">📍 {selectedService.category}</p>
                      )}
                    </div>
                  </div>
                  {selectedService.address && (
                    <div className="mb-3 p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Address</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedService.address}</p>
                    </div>
                  )}
                  {selectedService.phone && (
                    <div className="mb-3 p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Phone</p>
                      <a href={`tel:${selectedService.phone}`} className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                        {selectedService.phone}
                      </a>
                    </div>
                  )}
                  {selectedService.rating && (
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Rating</p>
                      <p className="text-sm font-semibold text-slate-900">⭐ {selectedService.rating} ({selectedService.reviews} reviews)</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Date & Time</h2>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">April 2026</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 hover:bg-slate-100 rounded">←</button>
                  <button className="px-3 py-1 hover:bg-slate-100 rounded">→</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-bold text-slate-600 py-2">
                    {day}
                  </div>
                ))}
                {[...Array(31)].map((_, i) => {
                  const date = i + 1;
                  const isSelected = booking.date === `2026-04-${String(date).padStart(2, '0')}`;
                  return (
                    <button
                      key={date}
                      onClick={() => setBooking({ ...booking, date: `2026-04-${String(date).padStart(2, '0')}` })}
                      className={`py-2 rounded font-semibold text-sm transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white'
                          : date <= 7 || date > 23
                            ? 'text-slate-300'
                            : 'hover:bg-slate-100'
                      } ${date <= 2 || date > 30 ? 'opacity-30' : ''}`}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Select Time</h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setBooking({ ...booking, time })}
                    className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                      booking.time === time
                        ? 'bg-teal-50 border-teal-400 text-teal-600'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <IconClock className="w-4 h-4 inline mr-2" />
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Provider Selection */}
        {step === 3 && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Provider</h2>
            <div className="space-y-4">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setBooking({ ...booking, providerId: provider.id })}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                    booking.providerId === provider.id
                      ? 'bg-teal-50 border-teal-400 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{provider.name}</h3>
                      <p className="text-slate-600 mb-3">{provider.specialty}</p>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <IconStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(provider.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-semibold text-slate-900">
                          {provider.rating} ({provider.reviews})
                        </span>
                      </div>
                    </div>
                    <IconUser className="w-8 h-8 text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="max-w-2xl bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Confirm Your Booking</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                {selectedPet?.image_url ? (
                  <img
                    src={selectedPet.image_url}
                    alt={selectedPet?.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-4xl">{selectedPet?.type === 'dog' ? '🐕' : '🐱'}</span>
                )}
                <div>
                  <p className="text-sm text-slate-600">Pet</p>
                  <p className="font-bold text-slate-900">{selectedPet?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <span className="text-4xl">📋</span>
                <div>
                  <p className="text-sm text-slate-600">Service</p>
                  <p className="font-bold text-slate-900">{selectedService?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <IconCalendar className="w-8 h-8 text-teal-600" />
                <div>
                  <p className="text-sm text-slate-600">Date & Time</p>
                  <p className="font-bold text-slate-900">
                    {booking.date} at {booking.time}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-600 mb-2">Appointment Fee</p>
                <p className="text-3xl font-bold text-teal-600">$60</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-12 max-w-2xl">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
              step === 1
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50'
            }`}
          >
            <IconChevronLeft className="w-5 h-5" />
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && (!booking.petId || (!booking.serviceId && !serviceIdFromUrl))) ||
                (step === 2 && (!booking.date || !booking.time)) ||
                (step === 3 && !booking.providerId)
              }
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-white ${
                (step === 1 && (!booking.petId || (!booking.serviceId && !serviceIdFromUrl))) ||
                (step === 2 && (!booking.date || !booking.time)) ||
                (step === 3 && !booking.providerId)
                  ? 'bg-teal-300 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              Next
              <IconChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-white ${
                isSubmitting
                  ? 'bg-teal-300 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <IconCheckCircle className="w-5 h-5" />
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
