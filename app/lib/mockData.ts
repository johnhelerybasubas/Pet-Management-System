// Mock Data for PawCare Pet Management System

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit';
  breed: string;
  age: number;
  weight: number;
  image: string;
  dateOfBirth: string;
  microchipId: string;
  allergies: string[];
  healthScore: number;
}

export interface Appointment {
  id: string;
  petId: string;
  type: 'vet-checkup' | 'grooming' | 'vaccination' | 'dental';
  date: string;
  time: string;
  provider: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  date: string;
  type: string;
  description: string;
  veterinarian: string;
}

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  date: string;
  nextDue: string;
  provider: string;
  status: 'completed' | 'pending' | 'overdue';
}

export interface Service {
  id: string;
  name: string;
  category: 'vet' | 'grooming' | 'training' | 'boarding';
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  hours: string;
  coordinates: { lat: number; lng: number };
  image: string;
}

export interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  category: 'dry-food' | 'wet-food' | 'treats' | 'supplements';
  petType: 'dog' | 'cat' | 'bird' | 'rabbit' | 'all';
  price: number;
  rating: number;
  image: string;
  inStock: boolean;
}

// Sample Pets
export const mockPets: Pet[] = [
  {
    id: '1',
    name: 'Buddy',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 4,
    weight: 32,
    image: '/pets/buddy.jpg',
    dateOfBirth: '2022-01-15',
    microchipId: 'MW123456789',
    allergies: [],
    healthScore: 92,
  },
  {
    id: '2',
    name: 'Luna',
    type: 'cat',
    breed: 'Tabby Cat',
    age: 2,
    weight: 4.5,
    image: '/pets/luna.jpg',
    dateOfBirth: '2024-01-20',
    microchipId: 'MW987654321',
    allergies: ['Fish'],
    healthScore: 88,
  },
  {
    id: '3',
    name: 'Snowball',
    type: 'dog',
    breed: 'Husky Mix',
    age: 3,
    weight: 25,
    image: '/pets/snowball.jpg',
    dateOfBirth: '2023-06-10',
    microchipId: 'MW456789012',
    allergies: [],
    healthScore: 85,
  },
  {
    id: '4',
    name: 'Mochi',
    type: 'cat',
    breed: 'Scottish Fold',
    age: 1,
    weight: 3.2,
    image: '/pets/mochi.jpg',
    dateOfBirth: '2025-03-05',
    microchipId: 'MW345678901',
    allergies: [],
    healthScore: 100,
  },
];

// Sample Appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    petId: '1',
    type: 'vet-checkup',
    date: '2026-04-03',
    time: '09:00 AM',
    provider: 'Dr. Sarah Smith',
    status: 'upcoming',
    notes: 'Annual wellness check',
  },
  {
    id: '2',
    petId: '2',
    type: 'grooming',
    date: '2026-04-05',
    time: '02:00 PM',
    provider: 'Paws & Claws Salon',
    status: 'upcoming',
    notes: 'Bath and full grooming',
  },
  {
    id: '3',
    petId: '1',
    type: 'vaccination',
    date: '2026-04-07',
    time: '10:30 AM',
    provider: 'Dr. Mark Johnson',
    status: 'upcoming',
    notes: 'DHPP Booster',
  },
];

// Sample Medical Records
export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    petId: '1',
    date: '2026-02-15',
    type: 'Wellness Exam',
    description: 'Annual wellness examination completed. Pet is healthy.',
    veterinarian: 'Dr. Sarah Smith',
  },
  {
    id: '2',
    petId: '1',
    date: '2025-12-10',
    type: 'Dental Cleaning',
    description: 'Professional dental cleaning performed. 2 teeth extractions.',
    veterinarian: 'Dr. Sarah Smith',
  },
];

// Sample Vaccinations
export const mockVaccinations: Vaccination[] = [
  {
    id: '1',
    petId: '1',
    name: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
    date: '2025-04-10',
    nextDue: '2026-04-10',
    provider: 'Dr. Sarah Smith',
    status: 'completed',
  },
  {
    id: '2',
    petId: '1',
    name: 'Rabies',
    date: '2024-06-15',
    nextDue: '2026-06-15',
    provider: 'Dr. Sarah Smith',
    status: 'pending',
  },
  {
    id: '3',
    petId: '2',
    name: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
    date: '2025-03-20',
    nextDue: '2026-03-20',
    provider: 'Dr. Mark Johnson',
    status: 'completed',
  },
];

// Sample Services (Butuan City)
export const mockServices: Service[] = [
  {
    id: '1',
    name: 'General Checkup',
    category: 'vet',
    address: '943 Ochoa Ave, Butuan City, Agusan del Norte 8600',
    phone: '(085) 225-0000',
    rating: 4.8,
    reviews: 245,
    hours: 'Mon-Fri: 9AM-5PM',
    coordinates: { lat: 8.9465, lng: 125.5361 },
    image: '/services/vet1.jpg',
  },
  {
    id: '2',
    name: 'Grooming Service',
    category: 'grooming',
    address: '456 Corrales Avenue, Butuan City, Agusan del Norte 8100',
    phone: '(085) 225-1111',
    rating: 4.6,
    reviews: 189,
    hours: '10:00 AM - 7:00 PM',
    coordinates: { lat: 8.9545625, lng: 125.5331875 },
    image: '/services/grooming1.jpg',
  },
  {
    id: '3',
    name: 'Vaccination Records',
    category: 'vet',
    address: '943 Ochoa Ave, Butuan City, Agusan del Norte 8600',
    phone: '(085) 225-0000',
    rating: 4.9,
    reviews: 156,
    hours: 'Mon-Fri: 9AM-5PM',
    coordinates: { lat: 8.9470, lng: 125.5366 },
    image: '/services/vaccination.jpg',
  },
  {
    id: '4',
    name: 'Boarding Service',
    category: 'boarding',
    address: '321 Bangkal Road, Butuan City, Agusan del Norte 8100',
    phone: '(085) 225-3333',
    rating: 4.7,
    reviews: 203,
    hours: '24/7',
    coordinates: { lat: 8.9700, lng: 125.5280 },
    image: '/services/boarding1.jpg',
  },
];

// Sample Food Products
export const mockFoodProducts: FoodProduct[] = [
  {
    id: '1',
    name: 'Premium Grain-Free Kibble',
    brand: 'PetNutrition+',
    category: 'dry-food',
    petType: 'dog',
    price: 45.99,
    rating: 4.7,
    image: '/products/kibble1.jpg',
    inStock: true,
  },
  {
    id: '2',
    name: 'Salmon Wet Food Cans',
    brand: 'FreshPet',
    category: 'wet-food',
    petType: 'cat',
    price: 28.99,
    rating: 4.8,
    image: '/products/wetfood1.jpg',
    inStock: true,
  },
  {
    id: '3',
    name: 'Training Treats',
    brand: 'DogDelight',
    category: 'treats',
    petType: 'dog',
    price: 12.99,
    rating: 4.6,
    image: '/products/treats1.jpg',
    inStock: true,
  },
  {
    id: '4',
    name: 'Joint Health Supplements',
    brand: 'VitaPets',
    category: 'supplements',
    petType: 'all',
    price: 34.99,
    rating: 4.5,
    image: '/products/supplement1.jpg',
    inStock: true,
  },
  {
    id: '5',
    name: 'Organic Kitten Food',
    brand: 'NaturalCat',
    category: 'dry-food',
    petType: 'cat',
    price: 38.99,
    rating: 4.9,
    image: '/products/kitten.jpg',
    inStock: true,
  },
];

// Reminders based on mock data
export const getUpcomingReminders = () => [
  {
    id: '1',
    title: "Buddy's Bordetella vaccination is overdue",
    description: 'scheduled',
    daysAway: 0,
    type: 'warning',
  },
  {
    id: '2',
    title: 'Appointment reminder: Vet checkup tomorrow at 10:00 AM',
    description: 'Buddy',
    daysAway: 1,
    type: 'info',
  },
  {
    id: '3',
    title: "Luna's feeding schedule: Remember evening meal at 6 PM",
    description: 'Luna',
    daysAway: 0,
    type: 'info',
  },
  {
    id: '4',
    title: "Luna's FeLV vaccination is overdue",
    description: 'overdue',
    daysAway: 0,
    type: 'warning',
  },
  {
    id: '5',
    title: "Snowball's vitamin supplement is running low",
    description: 'Snowball',
    daysAway: 3,
    type: 'info',
  },
];
