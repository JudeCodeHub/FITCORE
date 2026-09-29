"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { FloorPassBentoCard } from "./bento/floor-pass-bento-card";
import { ClassBookingBentoCard } from "./bento/class-booking-bento-card";
import { WorkoutPrBentoCard } from "./bento/workout-pr-bento-card";
import { MembershipFreezeBentoCard } from "./bento/membership-freeze-bento-card";
import { featuresStyles as styles } from "./features-section.styles";

function ScrollRevealRow({
  children,
  from = "left",
}: {
  children: React.ReactNode;
  from?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger transition every time element enters or leaves viewport
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.12,
        rootMargin: "-40px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const translateClass = isVisible
    ? "translate-x-0 opacity-100 scale-100"
    : from === "left"
    ? "-translate-x-16 sm:-translate-x-24 lg:-translate-x-36 opacity-0 scale-[0.98]"
    : "translate-x-16 sm:translate-x-24 lg:translate-x-36 opacity-0 scale-[0.98]";

  return (
    <div
      ref={ref}
      className={`transform-gpu transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${translateClass}`}
    >
      {children}
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className={styles.section}>
      {/* Soft ambient background radial glow */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* Section Header */}
      <div className={styles.headingWrap}>
        <div className={styles.eyebrowBadge}>
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>WHAT&apos;S INSIDE</span>
        </div>

        <h2 className={styles.title}>
          Built for high-octane gyms.
        </h2>

        <p className={styles.subtitle}>
          Turnstile QR passes, studio seat radar, PR milestone tracking, and 1-tap vacation holds — real gym superpowers in one unified platform.
        </p>
      </div>

      {/* Open, Unboxed Alternating Feature Rows */}
      <div className={styles.rowsList}>
        
        {/* Row 01: Text Left, Image Right (Glides in from Left) */}
        <ScrollRevealRow from="left">
          <FloorPassBentoCard />
        </ScrollRevealRow>

        {/* Row 02: Image Left, Text Right (Glides in from Right) */}
        <ScrollRevealRow from="right">
          <ClassBookingBentoCard />
        </ScrollRevealRow>

        {/* Row 03: Text Left, Image Right (Glides in from Left) */}
        <ScrollRevealRow from="left">
          <WorkoutPrBentoCard />
        </ScrollRevealRow>

        {/* Row 04: Image Left, Text Right (Glides in from Right) */}
        <ScrollRevealRow from="right">
          <MembershipFreezeBentoCard />
        </ScrollRevealRow>

      </div>
    </section>
  );
}
