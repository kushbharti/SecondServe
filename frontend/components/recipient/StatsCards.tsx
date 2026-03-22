'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { recipientApi } from '@/lib/recipient';
import { Package, UtensilsCrossed, DollarSign, TrendingUp } from 'lucide-react';
import { FoodListing } from '@/lib/donor';

export function StatsCards() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      if (user) {
        try {
          const data = await recipientApi.getRequests();
          setRequests(data);
        } catch (error) {
          console.error("Failed to fetch requests", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchRequests();
  }, [user]);

  const stats = useMemo(() => {
    if (!user || loading) {
      return {
        activeClaims: 0,
        totalMealsReceived: 0,
        totalFoodReceived: 0,
        moneySaved: 0
      };
    }

    const activeClaims = requests.filter(
      l => l.status === 'assigned'
    ).length;

    const completedListings = requests.filter(
      l => l.status === 'completed'
    );
    
    // Estimate meals (e.g. 1 meal per 0.5kg or parse quantity string)
    // For now, we'll try to parse quantity or assume a default if not numeric
    // This is a simplification. Backend should ideally provide 'quantity_value'.
    const totalFoodReceived = completedListings.length * 10; // Dummy avg weight
    const totalMealsReceived = completedListings.length * 20; // Dummy avg meals
    const moneySaved = totalMealsReceived * 5;

    return {
      activeClaims,
      totalMealsReceived,
      totalFoodReceived,
      moneySaved
    };
  }, [requests, user, loading]);

  const statCards = [
    {
      label: 'Active claims',
      value: stats.activeClaims,
      description: 'Food you\'ve claimed but not yet received',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Meals received',
      value: stats.totalMealsReceived.toLocaleString(),
      description: 'Total meals provided to your community',
      icon: UtensilsCrossed,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      label: 'Food received',
      value: `${stats.totalFoodReceived.toLocaleString()} lbs`,
      description: 'Total pounds of food rescued',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      label: 'Money saved',
      value: `$${stats.moneySaved.toLocaleString()}`,
      description: 'Estimated value of meals received',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  // Role Specific Capacity Card
  const capacityMetric = useMemo(() => {
    if (!user) return null;
    if (user.role === 'NGO') return { label: 'People Served', value: user.capacity_people_served || 0, desc: 'Target reach per month' };
    if (user.role === 'ORPHANAGE') return { label: 'Children Supported', value: user.capacity_children_supported || 0, desc: 'Current residents' };
    if (user.role === 'OLD_AGE_HOME') return { label: 'Residents', value: user.capacity_residents_supported || 0, desc: 'Seniors in care' };
    if (user.role === 'GOVERNMENT_HOSPITAL') return { label: 'Hospital Beds', value: user.number_of_beds || 0, desc: 'Total bed capacity' };
    return null;
  }, [user]);

  if (capacityMetric) {
    statCards.splice(1, 0, {
        label: capacityMetric.label,
        value: capacityMetric.value.toLocaleString(),
        description: capacityMetric.desc,
        icon: TrendingUp,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`group relative overflow-hidden rounded-2xl border ${stat.borderColor} ${stat.bgColor} p-5 shadow-sm transition-smooth hover-lift hover:shadow-md`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className={`rounded-xl ${stat.bgColor} p-2 transition-smooth group-hover:scale-110`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color.replace('text-', 'from-')} to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />
          </div>
        );
      })}
    </div>
  );
}
