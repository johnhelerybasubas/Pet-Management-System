'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getCachedSession } from '@/app/lib/supabase';

interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit';
  breed: string;
  age: number;
  weight: number;
  date_of_birth: string;
  microchip_id?: string;
  allergies?: string[];
  health_score: number;
  image_url?: string;
}

interface PetContextType {
  pets: Pet[];
  setPets: (pets: Pet[]) => void;
  addPet: (pet: Pet) => void;
  removePet: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  refetchPets: () => Promise<void>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchPets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const session = await getCachedSession();
      
      if (!session) {
        setError('Not authenticated');
        return;
      }

      console.log('Fetching pets with token:', session.access_token ? 'token exists' : 'no token');

      const response = await fetch('/api/pets', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      console.log('Pets response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Pets error response:', errorData);
        throw new Error('Failed to fetch pets');
      }

      const data = await response.json();
      setPets(data || []);
    } catch (err) {
      console.error('Error fetching pets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pets';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pets on mount
  useEffect(() => {
    refetchPets();
  }, []);

  const addPet = (pet: Pet) => {
    setPets([...pets, pet]);
  };

  const removePet = (id: string) => {
    setPets(pets.filter((pet) => pet.id !== id));
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        setPets,
        addPet,
        removePet,
        isLoading,
        error,
        refetchPets,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePets() {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePets must be used within a PetProvider');
  }
  return context;
}
