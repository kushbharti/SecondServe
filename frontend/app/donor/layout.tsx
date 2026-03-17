'use client';

import RoleLayout from '@/components/layout/RoleLayout';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  ClipboardList, 
  User,
  Inbox
} from 'lucide-react';

const navItems = [
  { href: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/donor/add-listing', label: 'Add Listing', icon: PlusCircle },
  { href: '/donor/listings', label: 'My Listings', icon: List },
  { href: '/donor/requests', label: 'Available Requests', icon: Inbox },
  { href: '/donor/orders', label: 'Orders', icon: ClipboardList },
  { href: '/donor/profile', label: 'Profile', icon: User },
];

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayout
      title="Donor Portal"
      subtitle="Manage your food donations"
      navItems={navItems}
      userRole="donor"
    >
      {children}
    </RoleLayout>
  );
}
