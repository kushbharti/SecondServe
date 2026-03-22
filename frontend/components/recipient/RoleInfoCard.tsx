'use client';

import { User } from '@/types/user';
import { 
  Building2, 
  FileText, 
  Users, 
  Globe, 
  ShieldCheck,
  PlusSquare
} from 'lucide-react';

interface RoleInfoCardProps {
  user: User;
}

export function RoleInfoCard({ user }: RoleInfoCardProps) {
  const isNGO = user.role === 'NGO';
  const isOrphanage = user.role === 'ORPHANAGE';
  const isOldAgeHome = user.role === 'OLD_AGE_HOME';
  const isHospital = user.role === 'GOVERNMENT_HOSPITAL';

  if (user.role === 'DONOR') return null;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-lg">Organization Details</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {/* Basic ID Info */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3 w-3" /> Registration Number
          </p>
          <p className="text-sm font-semibold truncate">
            {user.registration_number || user.cci_registration_number || user.hospital_registration_number || 'N/A'}
          </p>
        </div>

        {/* Capacity */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3 w-3" /> Scale / Capacity
          </p>
          <p className="text-sm font-semibold">
            {isNGO && `${user.capacity_people_served || 0} People Served`}
            {isOrphanage && `${user.capacity_children_supported || 0} Children`}
            {isOldAgeHome && `${user.capacity_residents_supported || 0} Residents`}
            {isHospital && `${user.number_of_beds || 0} Beds`}
          </p>
        </div>

        {/* Specialized Fields */}
        {isNGO && user.darpan_id && (
           <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Darpan ID
            </p>
            <p className="text-sm font-semibold">{user.darpan_id}</p>
          </div>
        )}

        {isHospital && user.hospital_type && (
            <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PlusSquare className="h-3 w-3" /> Hospital Type
            </p>
            <p className="text-sm font-semibold">{user.hospital_type}</p>
            </div>
        )}

        {/* Website */}
        {user.website_url && (
            <div className="space-y-1 col-span-full">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3 w-3" /> Official Website
                </p>
                <a 
                    href={user.website_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary hover:underline truncate block"
                >
                    {user.website_url.replace(/^https?:\/\//, '')}
                </a>
            </div>
        )}

        {/* Status */}
        <div className="col-span-full pt-2 border-t mt-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Verification Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 border border-green-200">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Approved
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}
