"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_HOME } from "@/lib/nav-config";
import { useAuth } from "@/shared/auth/auth-context";
import { FillRateChip } from "./mockups/fill-rate-chip";
import { MrrChartMockup } from "./mockups/mrr-chart-mockup";
import { heroStyles as styles } from "./hero-section.styles";

export function HeroSection() {
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && user;

  return (
    <section className={styles.section}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div>
          <span
            className={`${styles.eyebrow} animate-in fade-in slide-in-from-bottom-2 duration-700`}
          >
            Gym management, done with data
          </span>

          <h1
            className={`${styles.headline} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 [animation-fill-mode:backwards]`}
          >
            Run your gym on real numbers.
          </h1>

          <p
            className={`${styles.subhead} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 [animation-fill-mode:backwards]`}
          >
            Booking, billing policy, staff, and the analytics to back
            every decision — one platform, built for how gyms actually
            run.
          </p>

          <div
            className={`${styles.actions} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 [animation-fill-mode:backwards]`}
          >
            <Link
              href={isAuthed ? ROLE_HOME[user.role] : "/signup"}
              className={buttonVariants({ size: "lg", className: styles.primaryCta })}
            >
              {isAuthed ? "Go to Dashboard" : "Get Started"}
            </Link>
            <Link href="#features" className={styles.secondaryCta}>
              See how it works
            </Link>
          </div>
        </div>

        <div className={styles.visualWrap}>
          <div
            className={`${styles.visualCard} animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 [animation-fill-mode:backwards]`}
          >
            <MrrChartMockup />
            <div className={styles.visualChip}>
              <FillRateChip />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
