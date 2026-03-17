'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Background */}
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-blue-50/50 animate-aurora opacity-60" />
      
      {/* Floating Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-float opacity-70 mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-float opacity-60 mix-blend-multiply" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[90px] animate-pulse opacity-50" style={{ animationDelay: '4s' }} />

      {/* Main Glass Card */}
      <div className="w-full max-w-lg relative z-10">
        <div className="relative overflow-hidden rounded-[2.5rem] glass-card p-8 md:p-12 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
           {/* Decorative header glow */}
           <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-teal-500 to-primary" />
           
           <div className="text-center mb-8 space-y-2">
             <div className="flex justify-center mb-6">
                <Link href="/" className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/20 shadow-sm hover:scale-105 transition-transform backdrop-blur-sm">
                   <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-primary to-teal-600 flex items-center justify-center text-white text-xs font-bold">FR</div>
                   <span className="text-sm font-semibold tracking-tight">FoodRescue Connect</span>
                </Link>
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
             <p className="text-sm text-muted-foreground max-w-xs mx-auto">{subtitle}</p>
           </div>

           {children}

           <div className="mt-8 pt-6 border-t border-border/50 text-center">
             <p className="text-xs text-muted-foreground">
               {isLogin ? (
                 <>
                   Don't have an account?{' '}
                   <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                     Sign up
                   </Link>
                 </>
               ) : (
                 <>
                   Already have an account?{' '}
                   <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                     Log in
                   </Link>
                 </>
               )}
             </p>
           </div>
        </div>
        
        <p className="text-center text-[10px] text-muted-foreground mt-8 opacity-60">
          © {new Date().getFullYear()} FoodRescue Connect. Secure & Encrypted.
        </p>
      </div>
    </div>
  );
}

