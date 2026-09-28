"use client";

import Image from "next/image";
import Link from "next/link";
import { ROLE_HOME } from "@/lib/nav-config";
import { useAuth } from "@/shared/auth/auth-context";
import { heroStyles as styles } from "./hero-section.styles";

export function HeroSection() {
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && user;

  return (
    <section className={styles.section}>
      {/* Background Hero Image - Right anchored and shifted slightly left */}
      <div className={styles.imageContainer} aria-hidden="true">
        <Image
          src="/hero-img.png"
          alt="FitCore Fitness Training"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className={styles.backgroundImage}
        />
        {/* Soft edge blend into the black left background */}
        <div className={styles.imageFade} />
      </div>

      {/* Dark gradient overlay for text readability on mobile and left side */}
      <div className={styles.overlay} aria-hidden="true" />

      {/* Hero Content */}
      <div className={styles.inner}>
        <div className={styles.content}>
          <h1
            className={`${styles.headline} animate-in fade-in slide-in-from-bottom-4 duration-700`}
          >
            Transform Your Body
            <br />
            Empower Your Mind
          </h1>

          <p
            className={`${styles.subhead} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 [animation-fill-mode:backwards]`}
          >
            Achieve your fitness goals with a smarter way to manage your
            training and progress.
          </p>

          <div
            className={`${styles.actions} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 [animation-fill-mode:backwards]`}
          >
            <Link
              href={isAuthed ? ROLE_HOME[user.role] : "/signup"}
              className={styles.cta}
            >
              {isAuthed ? "Go to Dashboard" : "Start free trial"}
            </Link>
          </div>

          <div
            className={`${styles.stats} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 [animation-fill-mode:backwards]`}
          >
            <div className={styles.statItem}>
              <span className={styles.statValue}>400k+</span>
              <span className={styles.statLabel}>People trust with us</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>4.9</span>
              <span className={styles.statLabel}>Reviews from clients</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>10+</span>
              <span className={styles.statLabel}>
                Over 10 years of training experience
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
