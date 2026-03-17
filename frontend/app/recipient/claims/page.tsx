'use client';

import { FoodHistory } from '@/components/recipient/FoodHistory';

export default function ClaimsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Claims & History</h1>
        <p className="text-muted-foreground">
          Track the food you have claimed and view past pickups.
        </p>
      </div>

      <FoodHistory />
    </div>
  );
}
