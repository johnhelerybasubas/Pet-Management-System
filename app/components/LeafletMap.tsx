'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Service } from '@/app/lib/mockData';

interface LeafletMapProps {
  services: Service[];
  selectedServiceId?: string;
  onServiceSelect: (serviceId: string) => void;
}

// Fix for marker icons in Next.js
const createCustomIcon = (category: string, isSelected: boolean) => {
  const colors: Record<string, string> = {
    vet: '#10b981',
    grooming: '#f59e0b',
    training: '#8b5cf6',
    boarding: '#ec4899',
  };

  const color = colors[category] || '#3b82f6';
  const backgroundColor = isSelected ? color : '#94a3b8';

  return L.divIcon({
    html: `
      <div style="
        background-color: ${backgroundColor};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        cursor: pointer;
        transition: all 0.2s;
      ">
        <span style="color: white; font-weight: bold; font-size: 18px;">📍</span>
      </div>
    `,
    iconSize: [40, 40],
    className: 'custom-marker',
  });
};

export default function LeafletMap({
  services,
  selectedServiceId,
  onServiceSelect,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Filter services that have valid coordinates
  const validServices = services.filter(
    (service) => service.coordinates && service.coordinates.lat && service.coordinates.lng
  );

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map('map').setView([8.9746, 125.5308], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear existing markers
    Object.keys(markersRef.current).forEach((id) => {
      map.removeLayer(markersRef.current[id]);
    });
    markersRef.current = {};

    // Add markers for current services
    validServices.forEach((service) => {
      if (!service.coordinates) return;

      // Check if service is at Butuan Veterinary Clinic
      const clinicServices = ['General Checkup', 'Vaccination Records'];
      const isClinicService = clinicServices.includes(service.name);
      
      let popupContent = '<div><strong>' + service.name + '</strong>';
      if (isClinicService) {
        popupContent += '<br><span style="background-color: #0d9488; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">✓ Butuan Vet Clinic</span>';
      }
      popupContent += '<br><small>' + service.category + '</small><br><small>⭐ ' + service.rating + ' (' + service.reviews + ')</small></div>';

      const marker = L.marker(
        [service.coordinates.lat, service.coordinates.lng],
        {
          icon: createCustomIcon(service.category, service.id === selectedServiceId),
        }
      )
        .bindPopup(popupContent)
        .addTo(map);

      marker.on('click', () => {
        onServiceSelect(service.id);
      });

      markersRef.current[service.id] = marker;
    });
  }, [validServices, selectedServiceId, onServiceSelect]);

  return (
    <div
      id="map"
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
}
