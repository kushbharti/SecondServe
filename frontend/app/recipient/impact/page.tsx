'use client';

import { 
  BarChart2, 
  TrendingUp, 
  Leaf, 
  DollarSign
} from 'lucide-react';

export default function ImpactPage() {
  const stats = [
    {
      label: 'Meals Provided',
      value: '350',
      change: '+24 this month',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100/50',
    },
    {
      label: 'Food Rescued',
      value: '420 lbs',
      change: '+50 lbs this month',
      icon: Leaf,
      color: 'text-green-600',
      bg: 'bg-green-100/50',
    },
    {
      label: 'Money Saved',
      value: '$1,750',
      change: 'Approx. value',
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-100/50',
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Impact</h1>
        <p className="text-muted-foreground">
          See the difference you're making by rescuing food.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">
                    {stat.value}
                  </h3>
                </div>
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Chart Placeholder 1 */}
         <div className="rounded-2xl border bg-card p-6 shadow-xs h-[300px] flex flex-col">
            <h3 className="font-semibold mb-4">Monthly Savings</h3>
            <div className="flex-1 bg-muted/20 rounded-xl flex items-end justify-between p-4 gap-2">
               {[40, 60, 45, 70, 50, 80, 65, 90, 75, 55, 85, 95].map((h, i) => (
                  <div key={i} className="w-full bg-blue-500/80 rounded-t-sm hover:bg-blue-600 transition-colors relative group" style={{ height: `${h}%` }}>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${h * 20}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Impact Summary */}
         <div className="rounded-2xl border bg-linear-to-br from-green-50 to-background p-6 shadow-xs">
            <h3 className="font-semibold mb-4 text-green-900">Environmental Impact</h3>
            <div className="space-y-6">
               <div className="flex items-start gap-4">
                  <div className="rounded-full bg-green-100 p-3">
                     <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                     <h4 className="font-semibold text-green-900">CO2 Emissions Prevented</h4>
                     <p className="text-sm text-green-800/80 mt-1">
                        By diverting food from landfills, you have prevented approximately <strong>850 kg</strong> of CO2 emissions. That's equivalent to planting <strong>42 trees</strong>!
                     </p>
                  </div>
               </div>
               
               <div className="h-px bg-green-200" />
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 p-4 rounded-xl">
                     <p className="text-xs text-green-800 font-medium uppercase">Water Saved</p>
                     <p className="text-xl font-bold text-green-900">12,500 L</p>
                  </div>
                  <div className="bg-white/60 p-4 rounded-xl">
                     <p className="text-xs text-green-800 font-medium uppercase">Landfill Diverted</p>
                     <p className="text-xl font-bold text-green-900">210 kg</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
