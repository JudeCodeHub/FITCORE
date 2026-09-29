"use client";

import { EcosystemSection } from "./components/ecosystem-section";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";
import { LandingFooter } from "./components/landing-footer";
import { LandingHeader } from "./components/landing-header";
import { PricingSection } from "./components/pricing-section";
import { landingStyles as styles } from "./landing.styles";

export function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <EcosystemSection />
        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
}

