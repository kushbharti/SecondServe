import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ImpactStats } from '@/components/landing/ImpactStats';
import { About } from '@/components/landing/About';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/Footer';
import { LandingRedirect } from '@/components/landing/LandingRedirect';

export default function LandingPage() {
  return (
    <>
      <LandingRedirect />
      <Hero />
      <ImpactStats />
      <HowItWorks />
      <About />
      <CTASection />
      <LandingFooter />
    </>
  );
}

