import { TrendingUp, UtensilsCrossed, Leaf, MapPin } from 'lucide-react';

const stats = [
  {
    label: 'Meals Saved',
    value: '128k+',
    helper: 'Pounds of food rescued',
    icon: TrendingUp,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10'
  },
  {
    label: 'Meals Served',
    value: '342k+',
    helper: ' nutritious meals provided',
    icon: UtensilsCrossed,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10'
  },
  {
    label: 'CO₂ Prevented',
    value: '210t',
    helper: 'Carbon emissions avoided',
    icon: Leaf,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  {
    label: 'Communities',
    value: '24',
    helper: 'Active cities & regions',
    icon: MapPin,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  }
];

export function ImpactStats() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#0A261D] -z-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 to-black/80 -z-10" />
      
      {/* Abstract shapes */}
      <div className="absolute inset-0 overflow-hidden -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="container space-y-16 relative z-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between animate-fade-in">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md border border-white/10 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Real-time Impact
            </div>
            <h2 className="text-balance text-4xl font-extrabold text-white md:text-5xl lg:text-6xl tracking-tight leading-tight">
              Making a measurable difference in every neighborhood.
            </h2>
          </div>
          <p className="max-w-md text-lg text-emerald-100/70 md:text-right leading-relaxed font-medium">
             Verified metrics from our active communities showcasing the power of shared responsibility.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-[2rem] glass-card p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-white/10 bg-white/5"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                   <div className={`p-3 rounded-2xl ${stat.bg} backdrop-blur-xl`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                   </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <div className="flex items-center gap-3">
                      <div className={`md:hidden p-2 rounded-lg ${stat.bg}`}>
                         <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-100/50 group-hover:text-emerald-100/80 transition-colors">
                        {stat.label}
                      </p>
                   </div>
                  
                  <p className="text-5xl font-black tracking-tight text-white group-hover:scale-105 transition-transform duration-500 origin-left">
                    <span className="bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent group-hover:from-white group-hover:via-emerald-200 group-hover:to-teal-200 transition-all duration-500">
                      {stat.value}
                    </span>
                  </p>
                  <p className="text-sm text-emerald-100/60 font-medium">{stat.helper}</p>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

