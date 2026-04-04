'use client';

import { StatsCards } from '@/components/recipient/StatsCards';
import { MapSection } from '@/components/recipient/MapSection';
import { RoleInfoCard } from '@/components/recipient/RoleInfoCard';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ArrowRight, Package, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RecipientDashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'NGO';

  const welcomeMessages: Record<string, { title: string; desc: string }> = {
    NGO: { title: 'NGO Dashboard', desc: 'Manage your community distribution and track impact.' },
    ORPHANAGE: { title: 'Orphanage Dashboard', desc: 'Manage food requests for children in your care.' },
    OLD_AGE_HOME: { title: 'Old Age Home Dashboard', desc: 'Maintain food supply for your elderly residents.' },
    GOVERNMENT_HOSPITAL: { title: 'Hospital Dashboard', desc: 'Coordinate food logistics for patients and staff.' },
  };

  const message = welcomeMessages[role] || welcomeMessages.NGO;

  // FIXED: Show pending approval banner if account not yet approved
  const isPending = user?.verification_status === 'pending';
  const isRejected = user?.verification_status === 'rejected';

  if (isPending) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{message.title}</h1>
          <p className="text-muted-foreground">{message.desc}</p>
        </header>

        {/* Pending Approval Banner */}
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">Account Pending Approval</h2>
          <p className="text-amber-800 max-w-md mx-auto text-sm">
            Your account registration is under review by our admin team. You will be notified
            via email once your account is approved. This usually takes 1–2 business days.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-white border border-amber-100 text-left max-w-sm mx-auto space-y-2">
            <p className="text-xs font-semibold text-amber-800">What happens next?</p>
            <div className="flex items-start gap-2 text-xs text-amber-700">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>Admin reviews your registration documents</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-amber-700">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>You receive an email notification on approval</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-amber-700">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>Log in to start browsing and requesting food donations</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{message.title}</h1>
        </header>
        <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-8 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-destructive mb-2">Account Registration Rejected</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Your account registration was not approved. Please contact support for more information
            or register again with the correct documentation.
          </p>
        </div>
      </div>
    );
  }

  // Full dashboard for approved users
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {(user?.contact_person || user?.organization_name || user?.email?.split('@')[0] || 'there')} 👋
        </h1>
        <p className="text-muted-foreground">
          {message.desc}
        </p>
      </header>

      {/* Stats Overview */}
      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Section Widget */}
        <div className="lg:col-span-2 space-y-6">
           <MapSection />
        </div>

        {/* Dynamic Role Info Card & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
            {user && <RoleInfoCard user={user} />}
            
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-2">Ready to find food?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                   Browse our full catalog of available food donations in your area.
                </p>
                <Link 
                   href="/recipient/browse"
                   className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                >
                   <Package className="h-4 w-4" />
                   Browse All Food
                </Link>
            </div>
            
            <div className="rounded-2xl border bg-blue-50/50 p-6 shadow-sm">
                <h3 className="font-semibold text-blue-900 mb-2">Did you know?</h3>
                <p className="text-sm text-blue-800/80">
                   You can track your environmental impact in real-time. Check out your analytics dashboard to see your contribution!
                </p>
                <Link href="/recipient/impact" className="mt-3 block text-sm font-medium text-blue-700 hover:underline flex items-center gap-1">
                   View Impact Report <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
