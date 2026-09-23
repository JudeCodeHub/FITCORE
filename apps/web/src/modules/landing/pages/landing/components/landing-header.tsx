"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_HOME } from "@/lib/nav-config";
import { useAuth } from "@/shared/auth/auth-context";
import { landingHeaderStyles as styles } from "./landing-header.styles";

export function LandingHeader() {
  const { user, status } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={styles.wrapper(isScrolled)}>
      <div className={styles.inner}>
        <Link href="/" className={styles.wordmark}>
          FitCore
        </Link>

        <nav className={styles.nav}>
          {status === "authenticated" && user ? (
            <Link
              href={ROLE_HOME[user.role]}
              className={buttonVariants({ size: "sm", className: styles.ctaButton })}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>
                Login
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ size: "sm", className: styles.ctaButton })}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
