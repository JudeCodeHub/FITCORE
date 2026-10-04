"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Activity } from "lucide-react";
import { heroStyles as styles } from "./hero-section.styles";

export function HeroSection() {
  return (
    <section className={styles.section}>
      {/* Soft ambient background radial glow */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* Background Hero Image */}
      <div
        className={styles.imageContainer}
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, transparent 15%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.85) 50%, black 65%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, transparent 15%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.85) 50%, black 65%)",
        }}
        aria-hidden="true"
      >
        <Image
          src="/hero-img.png"
          alt="FitCore Fitness Training"
          fill
          priority
          sizes="100vw"
          className={styles.backgroundImage}
        />
      </div>


      {/* Hero Content */}
      <div className={styles.inner}>
        <div className={styles.content}>
          {/* Eyebrow Beacon Badge */}
          <div className={`${styles.badge} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span>NEXT-GEN GYM & PERFORMANCE HUB</span>
          </div>

          <h1
            className={`${styles.headline} animate-in fade-in slide-in-from-bottom-4 duration-700`}
          >
            Transform Your Body.
            <br />
            <span className={styles.headlineGradient}>Empower Your Mind.</span>
          </h1>

          <p
            className={`${styles.subhead} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 [animation-fill-mode:backwards]`}
          >
            Achieve peak physical performance with smart turnstile telemetry,
            sub-second class booking, and intelligent workout progression.
          </p>

          {/* Action CTAs */}
          <div
            className={`${styles.actions} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 [animation-fill-mode:backwards]`}
          >
            <Link href="/signup" className={styles.primaryBtn}>
              <span>Start Free Today</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#pricing" className={styles.secondaryBtn}>
              <span>Explore Memberships</span>
            </Link>
          </div>

          {/* Live Floor Pulse Chip */}
          <div className={styles.pulsePill}>
            <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>42 Athletes active right now · 99.8% Turnstile QR unlock rate</span>
          </div>

          {/* Stats Bar */}
          <div
            className={`${styles.stats} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 [animation-fill-mode:backwards]`}
          >
            <div className={styles.statItem}>
              <span className={styles.statValue}>400k+</span>
              <span className={styles.statLabel}>Workouts logged & tracked</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>4.9 ★</span>
              <span className={styles.statLabel}>Member satisfaction rating</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>100%</span>
              <span className={styles.statLabel}>
                Frictionless optical QR entry
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
