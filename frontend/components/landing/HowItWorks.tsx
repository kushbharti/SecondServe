import { Upload, MapPin, Truck, ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Donors post surplus',
    description: 'Restaurants and stores list surplus meals in under 2 minutes.',
    badge: 'For Donors',
    icon: Upload,
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  {
    id: 2,
    title: 'Recipients claim',
    description: 'Shelters see live listings and claim food with one tap.',
    badge: 'For Recipients',
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 3,
    title: 'Drivers deliver',
    description: 'Volunteers pick up and deliver food to where it\'s needed.',
    badge: 'For Drivers',
    icon: Truck,
    color: 'text-sky-600',
    bg: 'bg-sky-500/10'
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */ }
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center space-y-6 mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Simple Process
          </div>
          <h2 className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-foreground">
            How FoodRescue Works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A seamless three-sided marketplace that turns potential waste into community meals in just minutes.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Gradient Track (Desktop) */}
          <div className="hidden md:block absolute top-[85px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="group relative flex flex-col rounded-[2.5rem] border bg-white/50 backdrop-blur-sm p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/20 z-10 overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="mb-8 flex items-start justify-between relative transform group-hover:scale-105 transition-transform duration-500 origin-left">
                  <div className={`relative z-10 rounded-3xl p-5 transition-all duration-500 group-hover:scale-110 ${step.bg} shadow-lg shadow-black/5 group-hover:shadow-primary/20`}>
                    <Icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  <span className="font-mono text-8xl font-black text-muted/30 transition-all duration-500 group-hover:text-primary/10 absolute -top-10 -right-4 select-none group-hover:translate-x-2">
                    0{step.id}
                  </span>
                </div>

                <div className="space-y-4 flex-1 relative z-10">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg group-hover:text-foreground transition-colors">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between relative z-10">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-background border border-border ${step.color} shadow-sm group-hover:shadow-md transition-all`}>
                    {step.badge}
                  </span>
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground transform group-hover:-rotate-45 group-hover:scale-110 shadow-sm border border-border">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

