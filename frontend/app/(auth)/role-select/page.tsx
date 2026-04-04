'use client';
import Link from 'next/link';
import { Building2, HeartHandshake } from 'lucide-react';

export default function RoleSelectPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">How would you like to join us?</h1>
      <p className="text-muted-foreground mb-12 max-w-lg text-lg">
        Choose your role to get started. Whether you want to donate surplus food or you represent an organization in need, we have a place for you.
      </p>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link href="/register?type=donor" className="group relative flex flex-col items-center p-10 bg-card border-2 border-transparent hover:border-primary rounded-3xl shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <HeartHandshake className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">I want to Donate</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Restaurants, hotels, cafes, or individuals looking to donate surplus food and make a difference.
          </p>
        </Link>

        <Link href="/register?type=receiver" className="group relative flex flex-col items-center p-10 bg-card border-2 border-transparent hover:border-blue-500 rounded-3xl shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="h-24 w-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Building2 className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">I need Food</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            NGOs, orphanages, hospitals, or charities seeking reliable food donations for their communities.
          </p>
        </Link>
      </div>
      <p className="mt-12 text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
