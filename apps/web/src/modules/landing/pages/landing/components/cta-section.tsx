"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_HOME } from "@/lib/nav-config";
import { useAuth } from "@/shared/auth/auth-context";
import { ctaStyles as styles } from "./cta-section.styles";

export function CtaSection() {
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && user;

  return (
    <section className={styles.section}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <h2 className={styles.title}>Ready to see it in action?</h2>
        <Link
          href={isAuthed ? ROLE_HOME[user.role] : "/signup"}
          className={buttonVariants({ size: "lg", className: styles.cta })}
        >
          {isAuthed ? "Go to Dashboard" : "Get Started"}
        </Link>
      </div>
    </section>
  );
}
