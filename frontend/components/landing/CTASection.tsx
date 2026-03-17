import Link from 'next/link';
import { ArrowRight, Rocket, Star } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-blue-50/50 animate-aurora opacity-80 -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px] -z-10 animate-pulse" />

      <div className="container relative z-10">
        <div className="relative overflow-hidden rounded-[3rem] bg-[#022c22] p-8 md:p-20 text-center shadow-2xl ring-1 ring-white/10 isolate">
          {/* Inner decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] transform rotate-12">
            <Rocket className="w-96 h-96 text-emerald-400" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent -z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="relative z-10 flex flex-col items-center gap-10 max-w-4xl mx-auto">
             <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-2 text-sm font-bold text-emerald-300 ring-1 ring-inset ring-white/10 backdrop-blur-md shadow-lg animate-fade-in">
               <Star className="h-4 w-4 text-accent fill-accent" />
               <span className="tracking-wide">Join the movement today</span>
             </div>

            <h2 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl leading-tight">
              Ready to launch in your city?
            </h2>
            
            <p className="text-lg text-emerald-100/70 md:text-xl leading-relaxed max-w-2xl">
              Start connecting your local community today. Whether you're a donor, recipient, or driver, your contribution creates immediate impact.
            </p>

            <div className="flex flex-col w-full sm:w-auto sm:flex-row items-center gap-5 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-10 py-5 text-lg font-bold text-white shadow-xl shadow-accent/20 transition-all hover:bg-accent/90 hover:shadow-accent/40 hover:-translate-y-1 active:translate-y-0"
              >
                Get started now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-10 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
              >
                View live demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

