'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface RoleLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  userRole?: 'recipient' | 'donor';
}

export default function RoleLayout({
  children,
  navItems,
  title,
  subtitle,
  userRole = 'recipient'
}: RoleLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/5">
      <div className="flex flex-col lg:flex-row">
        <Sidebar 
          title={title} 
          subtitle={subtitle} 
          navItems={navItems} 
          userRole={userRole} 
        />
        
        <main className="flex-1 min-w-0 overflow-hidden">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
