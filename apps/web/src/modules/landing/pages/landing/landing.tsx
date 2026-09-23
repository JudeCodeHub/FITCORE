"use client";

import { CtaSection } from "./components/cta-section";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";
import { LandingFooter } from "./components/landing-footer";
import { LandingHeader } from "./components/landing-header";
import { PricingSection } from "./components/pricing-section";
import { StatsSection } from "./components/stats-section";
import { landingStyles as styles } from "./landing.styles";

export function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
