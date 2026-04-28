'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Service, mockServices } from '@/app/lib/mockData';
import { IconMapPin, IconStar, IconPhone, IconClock, IconZap } from '@/app/lib/icons';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/app/components/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-slate-200 rounded-2xl animate-pulse" />,
});

export default function ServicesFinder() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedServiceIds, setSavedServiceIds] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const categories = [
    { id: 'vet', label: '🏥 Veterinary', color: 'bg-teal-100 text-teal-700' },
    { id: 'grooming', label: '✂️ Grooming', color: 'bg-blue-100 text-blue-700' },
    { id: 'boarding', label: '🏠 Boarding', color: 'bg-orange-100 text-orange-700' },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Try to fetch services from backend
        try {
          const res = await fetch('/api/services');
          if (res.ok) {
            const data = await res.json();
            setServices(data);
            setSelectedService(data[0] || null);
          } else {
            setServices(mockServices);
            setSelectedService(mockServices[0] || null);
          }
        } catch (err) {
          console.log('Using fallback mock services');
          setServices(mockServices);
          setSelectedService(mockServices[0] || null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('savedServiceIds');
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setSavedServiceIds(parsed);
      }
    } catch (error) {
      console.error('Failed to load saved services:', error);
    }
  }, []);

  const handleToggleSave = () => {
    if (!selectedService) return;

    const isSaved = savedServiceIds.includes(selectedService.id);
    const updated = isSaved
      ? savedServiceIds.filter((id) => id !== selectedService.id)
      : [...savedServiceIds, selectedService.id];

    setSavedServiceIds(updated);
    localStorage.setItem('savedServiceIds', JSON.stringify(updated));
    setSaveMessage(isSaved ? 'Service removed from saved list.' : 'Service saved successfully.');

    setTimeout(() => {
      setSaveMessage(null);
    }, 2000);
  };

  const filteredServices = selectedCategory
    ? services.filter((s) => s.category === selectedCategory)
    : services;

  const categoryIconMap = {
    vet: '🏥',
    grooming: '✂️',
    boarding: '🏠',
  };

  const isSelectedServiceSaved = selectedService
    ? savedServiceIds.includes(selectedService.id)
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-600">Loading services...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Services Finder</h1>
        <p className="text-slate-600 mb-6">Find and book services for your pets</p>

        {/* Category Filter */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                selectedCategory === cat.id
                  ? cat.color + ' ring-2 ring-offset-2'
                  : 'bg-white border border-slate-200 text-slate-700 hover:shadow-md'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6 px-8 pb-12">
        {/* Services List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Available Services</h2>
            <p className="text-slate-600 text-sm">Showing {filteredServices.length} results</p>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="space-y-2 p-4">
              {filteredServices.map((service) => {
                // Services at Butuan Veterinary Clinic
                const clinicServices = ['General Checkup', 'Vaccination Records'];
                const isClinicService = clinicServices.includes(service.name);
                
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`w-full text-left p-4 rounded-xl transition-all border-2 ${
                      selectedService?.id === service.id
                        ? 'bg-teal-50 border-teal-400 shadow-md'
                        : 'bg-slate-50 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{categoryIconMap[service.category as keyof typeof categoryIconMap]}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{service.name}</h3>
                          {isClinicService && (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                              Butuan Vet Clinic
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <IconStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-slate-900">{service.rating}</span>
                          <span className="text-xs text-slate-500">({service.reviews})</span>
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <IconMapPin className="w-3 h-3" />
                          {service.address.split(',')[0]}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map and Service Detail */}
        <div className="space-y-6">
          {/* Interactive Leaflet Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <LeafletMap
              services={services}
              selectedServiceId={selectedService?.id}
              onServiceSelect={(serviceId) => {
                const service = services.find((s) => s.id === serviceId);
                if (service) setSelectedService(service);
              }}
            />
          </div>

          {/* Service Detail Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {selectedService ? (
              <>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedService.name}</h2>

            <div className="space-y-4">
              {/* Rating */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <IconStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(selectedService.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">{selectedService.rating}</span>
                  <span className="text-slate-600 text-sm">({selectedService.reviews} reviews)</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-3">
                <IconMapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Address</p>
                  <p className="font-semibold text-slate-900">{selectedService.address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-3">
                <IconPhone className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <a href={`tel:${selectedService.phone}`} className="font-semibold text-teal-600 hover:text-teal-700">
                    {selectedService.phone}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-3">
                <IconClock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Hours</p>
                  <p className="font-semibold text-slate-900">{selectedService.hours}</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    router.push(`/booking?serviceId=${selectedService.id}`);
                  }}
                  className="flex-1 bg-teal-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <IconZap className="w-5 h-5" />
                  Book Now
                </button>
                <button
                  onClick={handleToggleSave}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                    isSelectedServiceSaved
                      ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {isSelectedServiceSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              {saveMessage && (
                <p className="mt-3 text-sm text-teal-700 font-medium">{saveMessage}</p>
              )}
            </div>
              </>
            ) : (
              <p className="text-slate-500">Select a service to view details</p>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
