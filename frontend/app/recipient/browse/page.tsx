'use client';

import { FoodGallery } from '@/components/recipient/FoodGallery';
import { Search, Filter } from 'lucide-react';

export default function BrowseFoodPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Food</h1>
          <p className="text-muted-foreground">
             Find available food donations in your area.
          </p>
        </div>
      </div>

       {/* Search & Filter */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-xs mb-6">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
               placeholder="Search by food type, location..." 
               className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
         </div>
         <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filter
         </button>
      </div>

      <FoodGallery />
    </div>
  );
}
