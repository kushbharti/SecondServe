import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ImpactStats } from '@/components/landing/ImpactStats';
import { About } from '@/components/landing/About';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ImpactStats />
      <HowItWorks />
      <About />
      <CTASection />
      <LandingFooter />
    </>
  );
}

