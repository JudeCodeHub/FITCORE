"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { ROLE_HOME } from "@/lib/nav-config";
import { useAuth } from "@/shared/auth/auth-context";
import { landingHeaderStyles as styles } from "./landing-header.styles";

export function LandingHeader() {
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && user;

  return (
    <header className={styles.wrapper}>
      <div className={styles.inner}>
        {/* Left: Brand with Icon Placeholder */}
        <Link href="/" className={styles.brand}>
          {/* ======================================================== */}
          {/* ICON PLACEHOLDER: Update or replace this icon as needed */}
          {/* ======================================================== */}
          <div className={styles.iconPlaceholder} aria-hidden="true">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <span className={styles.wordmark}>FitCore</span>
        </Link>

        {/* Right: Navigation Links & Action Button */}
        <nav className={styles.nav} aria-label="Main Navigation">
          <Link href="#features" className={styles.navLink}>
            Features
          </Link>
          <Link href="#pricing" className={styles.navLink}>
            Pricing
          </Link>

          {isAuthed ? (
            <Link href={ROLE_HOME[user.role]} className={styles.ctaButton}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>
                Login
              </Link>
              <Link href="/signup" className={styles.ctaButton}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
