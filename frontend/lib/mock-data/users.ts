import type { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 'donor-1',
    role: 'DONOR',
    full_name: 'GreenBite Bistro',
    email: 'donor@example.org',
    phone_number: '+14155550101',
    organization_name: 'GreenBite Bistro',
    profile_image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=200&q=80',
    date_joined: new Date().toISOString()
  },
  {
    id: 'recipient-1',
    role: 'NGO',
    full_name: 'Hope Street Shelter',
    email: 'recipient@example.org',
    phone_number: '+14155550102',
    organization_name: 'Hope Street Shelter',
    profile_image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    date_joined: new Date().toISOString()
  },
  {
    id: 'admin-1',
    role: 'admin',
    full_name: 'Alex Rivera',
    email: 'admin@example.org',
    phone_number: '+14155550103',
    profile_image:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    date_joined: new Date().toISOString()
  }
];

