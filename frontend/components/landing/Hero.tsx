import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, MapPin, Sparkles, TrendingUp, Leaf, Store } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-24 pb-20 lg:pb-32">
      {/* Background - Subtle Radial Gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
              <Sparkles className="h-4 w-4" />
              <span>Turning surplus into impact</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1]">
              Rescue food.
              <br />
              <span className="bg-gradient-to-r from-primary via-teal-500 to-accent bg-clip-text text-transparent">
                Feed community.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-muted-foreground md:text-xl leading-relaxed max-w-2xl">
              Connect surplus food from local businesses with shelters instantly. 
              Join the movement to end food waste in your neighborhood today.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 hover:-translate-y-1"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-background border border-input px-8 py-4 text-lg font-medium text-foreground shadow-sm transition-all hover:bg-accent/5 hover:text-accent hover:border-accent/20"
              >
                How it works
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-6 text-sm font-medium text-muted-foreground">
               <div className="flex items-center gap-2">
                 <div className="p-1 rounded-full bg-emerald-100/50 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></div>
                 <span>Verified Partners</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="p-1 rounded-full bg-blue-100/50 text-blue-600"><MapPin className="w-4 h-4" /></div>
                 <span>Local Impact</span>
               </div>
            </div>
          </div>

          {/* Right Visual - Clean Glass Card */}
          <div className="relative isolate w-full max-w-[500px] mx-auto lg:mr-0 animate-slide-in delay-100">
             {/* Subtle Glow behind */}
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-teal-100/20 rounded-[3rem] blur-3xl -z-10" />

            <div className="relative rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-2xl shadow-2xl overflow-hidden p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-10 w-10 rounded-full border-2 border-white bg-gray-${i}00`} />
                    ))}
                    <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">+2k</div>
                 </div>
                 <div className="px-3 py-1 rounded-full bg-white/50 border border-white/60 text-xs font-bold text-emerald-700 shadow-sm flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    Live Activity
                 </div>
              </div>

              {/* Main Stat */}
              <div className="space-y-2 mb-8">
                 <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Meals Rescued Today</p>
                 <div className="flex items-baseline gap-4">
                    <span className="text-6xl font-black tracking-tight text-foreground">1,284</span>
                    <span className="text-emerald-600 font-bold bg-emerald-100/50 px-2 py-1 rounded-lg text-sm">
                      <TrendingUp className="w-4 h-4 inline mr-1" /> +12%
                    </span>
                 </div>
              </div>

               {/* Secondary Stats Grid */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/60 border border-white/50 shadow-sm">
                     <Leaf className="w-6 h-6 text-emerald-600 mb-2" />
                     <div className="text-2xl font-bold text-foreground">3.1t</div>
                     <div className="text-xs text-muted-foreground font-medium">CO₂ Saved</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/60 border border-white/50 shadow-sm">
                     <Store className="w-6 h-6 text-blue-600 mb-2" />
                     <div className="text-2xl font-bold text-foreground">42</div>
                     <div className="text-xs text-muted-foreground font-medium">New Donors</div>
                  </div>
               </div>
            </div>

            {/* Floating Element - Only One for Minimal look */}
            <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-white shadow-xl border border-gray-100 flex items-center gap-3 animate-float overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                <div className="relative h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                   <Clock className="w-5 h-5" />
                </div>
                <div className="relative">
                   <div className="text-xs font-bold text-gray-500">Avg. Response</div>
                   <div className="text-sm font-black text-gray-900">~ 24 mins</div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

