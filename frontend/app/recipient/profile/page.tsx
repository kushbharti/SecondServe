'use client';

import { StatsCards } from '@/components/recipient/StatsCards';
import { ProfileManagement } from '@/components/recipient/ProfileManagement';

export default function RecipientProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          View and update your profile details, and see a snapshot of your impact.
        </p>
      </header>
      <StatsCards />
      <ProfileManagement />
    </div>
  );
}

