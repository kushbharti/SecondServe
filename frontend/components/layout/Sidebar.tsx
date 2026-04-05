'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  userRole?: 'recipient' | 'donor' | 'admin';
}

export function Sidebar({ title, subtitle, navItems, userRole = 'recipient' }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (href: string) => 
    pathname === href || pathname.startsWith(href + '/');

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Role based colors/gradients
  const getRoleTheme = () => {
    switch(userRole) {
      case 'admin':
        return {
          gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
          activeBg: 'bg-blue-100/80 text-blue-900',
          activeIcon: 'text-blue-600',
          hover: 'hover:bg-blue-50 hover:text-blue-800',
          border: 'border-blue-200/50'
        };
      case 'donor':
        return {
          gradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
          activeBg: 'bg-orange-100/80 text-orange-900',
          activeIcon: 'text-orange-600',
          hover: 'hover:bg-orange-50 hover:text-orange-800',
          border: 'border-orange-200/50'
        };

      default: // recipient
        return {
          gradient: 'from-green-500/10 via-green-500/5 to-transparent',
          activeBg: 'bg-green-100/80 text-green-900',
          activeIcon: 'text-green-600',
          hover: 'hover:bg-green-50 hover:text-green-800',
          border: 'border-green-200/50'
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 glass-card border-b sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", theme.activeBg)}>
            <LayoutDashboard className={cn("w-5 h-5", theme.activeIcon)} />
          </div>
          <div>
            <h1 className="font-bold text-sm text-foreground">{title}</h1>
            <p className="text-[10px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-[100dvh] glass-card border-r transition-all duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-72",
          theme.border
        )}
      >
        <div className="flex flex-col h-full bg-linear-to-b from-background to-muted/20">
          {/* Header */}
          <div className={cn(
            "p-6 flex items-center justify-between",
            isCollapsed && "flex-col gap-4 p-4"
          )}>
            {!isCollapsed ? (
              <div className="overflow-hidden whitespace-nowrap transition-all duration-300">
                <h1 className="font-bold text-lg bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                  {title}
                </h1>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {subtitle}
                </p>
              </div>
            ) : (
              <div className={cn("p-2 rounded-xl transition-all duration-300", theme.activeBg)}>
                <LayoutDashboard className={cn("w-6 h-6", theme.activeIcon)} />
              </div>
            )}

            {!isMobile && (
              <button 
                onClick={toggleCollapse}
                className={cn(
                  "p-1.5 rounded-full hover:bg-muted transition-colors border shadow-xs",
                  isCollapsed && "rotate-180"
                )}
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            
            {/* Close button on mobile */}
            <div className="lg:hidden">
               <button onClick={() => setIsMobileOpen(false)}>
                  <X className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden",
                    active ? cn("shadow-xs font-medium", theme.activeBg) : cn("text-muted-foreground", theme.hover),
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Active Indicator Line */}
                  {active && (
                    <div className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-300",
                      userRole === 'recipient' ? 'bg-green-500' : 
                      userRole === 'donor' ? 'bg-orange-500' : 'bg-blue-500'
                    )} />
                  )}

                  <Icon className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    active ? theme.activeIcon : "text-muted-foreground/70 group-hover:text-foreground"
                  )} />
                  
                  {!isCollapsed && (
                    <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.label}
                    </span>
                  )}

                  {!isCollapsed && active && (
                    <ChevronRight className={cn(
                      "ml-auto w-4 h-4 opacity-50", 
                      theme.activeIcon
                    )} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer / User Profile */}
          <div className={cn(
            "p-4 border-t bg-muted/30 backdrop-blur-sm",
            isCollapsed && "items-center"
          )}>
            <div className="space-y-1">
              <button
                onClick={() => {
                   logout();
                   setIsMobileOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700",
                  isCollapsed && "justify-center"
                )}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
