import { Heart, Users, Leaf, Target } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Community Impact',
    description: 'Connect surplus food with those who need it most, reducing hunger and food waste in your community.',
    color: 'text-red-500'
  },
  {
    icon: Leaf,
    title: 'Environmental Sustainability',
    description: 'Prevent food waste from reaching landfills, reducing greenhouse gas emissions and protecting our planet.',
    color: 'text-emerald-500'
  },
  {
    icon: Users,
    title: 'Collaborative Network',
    description: 'Build a network of donors and recipients working together to make a meaningful difference.',
    color: 'text-blue-500'
  },
  {
    icon: Target,
    title: 'Real-Time Tracking',
    description: 'Track food donations from listing to delivery with transparent, real-time updates and impact metrics.',
    color: 'text-purple-500'
  }
];

export function About() {
  return (
    <section className="border-t bg-background py-12 md:py-20">
      <div className="container space-y-10">
        <div className="mx-auto max-w-2xl text-center space-y-4 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
            About FoodRescue Connect
          </p>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Building a better future, one meal at a time
          </h2>
          <p className="text-balance text-sm text-muted-foreground md:text-base">
            FoodRescue Connect is a technology platform designed to bridge the gap between 
            surplus food and those who need it. We connect restaurants, grocery stores, and 
            caterers with shelters and food banks to ensure good food 
            never goes to waste.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm transition-smooth hover-lift hover:border-primary-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-smooth group-hover:scale-110 ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
