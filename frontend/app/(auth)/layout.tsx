'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, HeartHandshake, Sprout, ArrowRight } from 'lucide-react';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLogin = pathname?.includes('/login');
  const title = isLogin ? 'Welcome back' : 'Join FoodRescue';
  const subtitle = isLogin
    ? 'Enter your credentials to access your account'
    : 'Start rescuing food in your community today';

  return (
    <div className="min-h-screen w-full flex bg-background sm:p-4 md:p-6 lg:p-8">
      {/* Container */}
      <div className="flex w-full overflow-hidden rounded-[2.5rem] bg-card border shadow-2xl relative">
        
        {/* LEFT SIDE: Decorative Content (Hidden on Mobile) */}
        <div className="hidden lg:flex relative w-[45%] xl:w-1/2 flex-col justify-between overflow-hidden p-12 text-white">
          {/* Background image / gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-primary z-0" />
          
          {/* Animated meshes / shapes */}
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] animate-float opacity-70 mix-blend-overlay" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-[100px] animate-float opacity-60 mix-blend-overlay" style={{ animationDelay: '2s' }} />
          
          {/* Content overlay */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 shadow-sm hover:bg-white/20 transition-all backdrop-blur-md">
              <div className="h-8 w-8 rounded-lg outline outline-2 outline-white/30 outline-offset-2 bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white drop-shadow-sm">SecondServe</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-lg mb-[10vh]">
            <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15] text-white drop-shadow-md">
              Share Food,<br/><span className="text-emerald-200">Spread Happiness.</span>
            </h1>
            <p className="text-lg text-emerald-50/90 font-medium leading-relaxed mb-10 max-w-md">
              Bridge the gap between excess and empty plates. Join thousands of donors and NGOs building a hunger-free community.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <HeartHandshake className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Impact Driven</h3>
                  <p className="text-sm text-emerald-100">Zero waste policy directly helping those in need.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sustainable Future</h3>
                  <p className="text-sm text-emerald-100">Every meal saved reduces carbon footprints.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-3 text-sm font-medium text-emerald-100/70">
            © {new Date().getFullYear()} SecondServe. <span className="w-1 h-1 rounded-full bg-emerald-300"></span> Secure Platform
          </div>
        </div>

        {/* RIGHT SIDE: Authentication Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative bg-secondary/30">
           {/* Mobile header (hidden on desktop) */}
           <div className="absolute top-6 left-6 lg:hidden flex items-center">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md group-hover:bg-emerald-700 transition-colors">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <span className="font-bold text-foreground">SecondServe</span>
              </Link>
           </div>

           <div className="w-full max-w-md">
             <div className="text-center md:text-left mb-10 space-y-3">
               <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{title}</h2>
               <p className="text-base text-muted-foreground">{subtitle}</p>
             </div>

             <div className="clay-card p-6 md:p-8 border-none bg-white/80">
                {children}

                <div className="mt-8 pt-6 border-t border-border/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? (
                      <>
                        Don't have an account?{' '}
                        <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group">
                          Join us <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </>
                    ) : (
                      <>
                        Already a member?{' '}
                        <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group">
                          Log in <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </>
                    )}
                  </p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

