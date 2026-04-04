import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FoodRescue Connect",
  description:
    "Connect surplus food from donors with shelters and food banks.",
};

import AuthProvider from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-gradient-to-b from-background via-primary-50/40 to-secondary-50/40">
              {children}
            </main>
          <footer className="border-t bg-background/80 backdrop-blur-sm">
            <div className="container flex h-16 items-center justify-between text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} FoodRescue Connect</span>
              <div className="flex gap-4">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </footer>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
