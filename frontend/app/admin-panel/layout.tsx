'use client';

import RoleLayout from '@/components/layout/RoleLayout';
import { 
  LayoutDashboard, 
  Users,
  LineChart
} from 'lucide-react';

const navItems = [
  { href: '/admin-panel', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin-panel/manage-receivers', label: 'Manage Receivers', icon: Users },
  { href: '/admin-panel/insights', label: 'Receiver Insights', icon: LineChart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayout
      title="Admin Portal"
      subtitle="Manage users and platform analytics"
      navItems={navItems}
      userRole="admin"
    >
      {children}
    </RoleLayout>
  );
}
