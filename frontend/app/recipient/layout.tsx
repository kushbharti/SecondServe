'use client';

import RoleLayout from '@/components/layout/RoleLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  Package,
  BarChart2,
  User,
  PlusCircle,
  List,
  Home,
  Heart,
  PlusSquare,
  Building,
  Map,
} from 'lucide-react';

export default function RecipientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const role = user?.role || 'ngo';

  const roleConfigs: Record<string, { title: string; subtitle: string; icon: any }> = {
    ngo: { title: 'NGO Workspace', subtitle: 'Community Outreach & Food Distribution', icon: Heart },
    orphanage: { title: 'Orphanage Workspace', subtitle: 'Supporting Child Welfare', icon: Home },
    old_age_home: { title: 'Old Age Home Workspace', subtitle: 'Care for Seniors', icon: Building },
    hospital: { title: 'Hospital Workspace', subtitle: 'Healthcare Food Management', icon: PlusSquare },
  };

  const config = roleConfigs[role] || roleConfigs.ngo;

  const navItems = [
    { href: '/recipient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/recipient/browse', label: 'Available Food', icon: Package },
    { href: '/recipient/map', label: 'Nearby Map', icon: Map },
    { href: '/recipient/add-request', label: 'Create Request', icon: PlusCircle },
    { href: '/recipient/requests', label: 'My Requests', icon: List },
    { href: '/recipient/claims', label: 'My claims', icon: ClipboardList },
    { href: '/recipient/impact', label: 'Impact analytics', icon: BarChart2 },
    { href: '/recipient/profile', label: 'Profile', icon: User }
  ];

  return (
    <RoleLayout
      title={config.title}
      subtitle={config.subtitle}
      navItems={navItems}
      userRole="recipient"
    >
      {children}
    </RoleLayout>
  );
}
