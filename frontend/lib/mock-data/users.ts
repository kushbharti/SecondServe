import type { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 'donor-1',
    role: 'donor',
    name: 'GreenBite Bistro',
    email: 'donor@example.org',
    phone: '+14155550101',
    organizationName: 'GreenBite Bistro',
    avatarUrl:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'recipient-1',
    role: 'recipient',
    name: 'Hope Street Shelter',
    email: 'recipient@example.org',
    phone: '+14155550102',
    organizationName: 'Hope Street Shelter',
    avatarUrl:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'driver-1',
    role: 'driver',
    name: 'Alex Rivera',
    email: 'driver@example.org',
    phone: '+14155550103',
    avatarUrl:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString()
  }
];

