'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Home,
  Package,
  MapPin,
  Truck,
  Menu,
  X,
  LayoutDashboard,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this utility exists, if not I'll inline it or use clsx directly

// In case cn doesn't exist, I'll define a simple helper or just use template literals
// Checking previous files, I haven't seen lib/utils.ts content but commonly used in shadcn.
// I'll assume standard class merging. If not, I will use template strings.
// To be safe, I will implement a local helper or using standard string interpolation for now.

function getDashboardPath(role: string) {
  switch (role) {
    case 'donor': return '/donor/dashboard';
    case 'recipient': return '/recipient/dashboard';
    case 'driver': return '/driver/dashboard';
    default: return '/';
  }
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsProfileOpen(false);
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  const navLinks = [
    { href: '/donor/dashboard', label: 'Donors', icon: Package, role: 'donor' },
    { href: '/recipient/dashboard', label: 'Recipients', icon: Heart, role: 'recipient' },
    { href: '/driver/dashboard', label: 'Drivers', icon: Truck, role: 'driver' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${
          scrolled || isMobileMenuOpen 
            ? 'bg-background/70 backdrop-blur-xl backdrop-saturate-150 border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60' 
            : 'bg-transparent border-transparent py-2'
        }`}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-emerald-500 to-teal-500 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-primary/40">
              <span className="font-bold text-xl tracking-tighter">FR</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
              FoodRescue
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {isAuthenticated && user && navLinks.map((link) => {
              // Only show the link corresponding to the user's role
              if (user.role !== link.role) return null;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 group overflow-hidden ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/10 shadow-inner'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <link.icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${isActive(link.href) ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 pl-6">
            {isAuthenticated && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border transition-all duration-300 ${
                    isProfileOpen 
                      ? 'bg-muted border-primary/30 ring-4 ring-primary/5 shadow-inner' 
                      : 'bg-background/50 border-border hover:border-primary/30 hover:bg-muted/60 hover:shadow-sm'
                  }`}
                >
                  <div className="relative">
                     <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-emerald-600 p-[2px]">
                        <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                           {user.profile_image ? (
                             <img src={user.profile_image} alt={user.full_name} className="h-full w-full object-cover" />
                           ) : (
                             <span className="text-primary font-bold text-sm">{user.full_name.charAt(0).toUpperCase()}</span>
                           )}
                        </div>
                     </div>
                     <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                  </div>
                  
                  <div className="flex flex-col items-start hidden md:flex">
                     <span className="text-sm font-semibold leading-none text-foreground">
                        {user.full_name.split(' ')[0]}
                     </span>
                     <span className="text-[10px] font-medium text-muted-foreground capitalize leading-none mt-1">
                        {user.role}
                     </span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <div 
                  className={`absolute right-0 mt-4 w-72 rounded-3xl border border-border/50 bg-background/80 backdrop-blur-2xl shadow-2xl p-3 transition-all duration-300 origin-top-right z-[60] ${
                    isProfileOpen 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
                  }`}
                >
                  <div className="px-4 py-4 mb-2 bg-muted/50 rounded-2xl border border-border/50">
                    <p className="font-bold text-foreground truncate">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate font-medium">{user.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Link
                      href={getDashboardPath(user.role)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="p-2 rounded-xl bg-background border shadow-sm group-hover:border-primary/20 transition-colors">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      Dashboard
                    </Link>
                    <Link
                      href={`/${user.role}/profile`}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="p-2 rounded-xl bg-background border shadow-sm group-hover:border-primary/20 transition-colors">
                        <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="p-2 rounded-xl bg-background border shadow-sm group-hover:border-primary/20 transition-colors">
                        <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      Settings
                    </Link>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl text-destructive hover:bg-destructive/10 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-background border shadow-sm group-hover:border-destructive/20 transition-colors">
                        <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </div>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-white/10"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-full"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`md:hidden fixed inset-x-0 top-20 bottom-0 bg-background/95 backdrop-blur-2xl border-t border-border/50 transition-all duration-500 z-40 ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="p-6 space-y-6 overflow-y-auto max-h-full flex flex-col">
            {isAuthenticated && user && (
               <div className="flex items-center gap-4 p-5 rounded-3xl bg-muted/60 border border-border/50">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 p-[2px]">
                     <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                        {user.profile_image ? (
                           <img src={user.profile_image} alt={user.full_name} className="h-full w-full object-cover" />
                        ) : (
                           <span className="text-xl font-bold text-primary">{user.full_name.charAt(0).toUpperCase()}</span>
                        )}
                     </div>
                  </div>
                  <div>
                     <p className="font-bold text-lg text-foreground">{user.full_name}</p>
                     <p className="text-sm text-muted-foreground capitalize font-medium">{user.role}</p>
                  </div>
               </div>
            )}

            <nav className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-medium hover:bg-muted/80 transition-colors border border-transparent hover:border-border/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                   <Home className="h-5 w-5" />
                </div>
                Home
              </Link>
              
              {isAuthenticated && user && (
                 <Link
                   href={getDashboardPath(user.role)}
                   className="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-medium bg-primary/5 text-primary border border-primary/10"
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                   <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                      <LayoutDashboard className="h-5 w-5" />
                   </div>
                   Dashboard
                 </Link>
              )}

{/* General Links for logged out users or extra links - Hidden specific role dashboards for public */}
              {/* {!isAuthenticated && navLinks.map(link => (
                 <Link
                   key={link.href}
                   href={link.href}
                   className="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-medium hover:bg-muted/80 transition-colors border border-transparent hover:border-border/50"
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                   <div className="p-2 rounded-xl bg-muted text-muted-foreground group-hover:text-primary">
                      <link.icon className="h-5 w-5" />
                   </div>
                   {link.label}
                 </Link>
              ))} */}
            </nav>

            {!isAuthenticated ? (
               <div className="grid gap-4 pt-8 mt-auto">
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full px-6 py-4 rounded-2xl border-2 border-muted-foreground/10 font-bold hover:bg-muted transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center w-full px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign up now
                  </Link>
               </div>
            ) : (
               <div className="pt-8 mt-auto border-t border-border/50">
                  <button
                    onClick={() => {
                       handleLogout();
                       setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-4 px-5 py-4 rounded-2xl text-lg font-medium text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/10"
                  >
                     <div className="p-2 rounded-xl bg-destructive/10">
                        <LogOut className="h-5 w-5" />
                     </div>
                    Sign Out
                  </button>
               </div>
            )}
          </div>
        </div>
      </header>
      {/* Spacer to prevent content overlap */}
      <div className="h-24 md:h-28" /> 
    </>
  );
}
