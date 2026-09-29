"use client";

import Link from "next/link";
import { Network } from "lucide-react";
import { ROLE_HOME } from "@/lib/nav-config";
import { useAuth } from "@/shared/auth/auth-context";
import { EcosystemOrbital } from "./mockups/ecosystem-orbital";
import { ecosystemStyles as styles } from "./ecosystem-section.styles";

export function EcosystemSection() {
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && user;

  return (
    <section id="ecosystem" className={styles.section}>
      {/* Soft background ambient glow */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* Section Header */}
      <div className={styles.headingWrap}>
        <div className={styles.eyebrowBadge}>
          <Network className="h-3.5 w-3.5 text-primary" />
          <span>CONNECTED ECOSYSTEM</span>
        </div>

        <h2 className={styles.sectionTitle}>
          Every tool wired into one platform.
        </h2>

        <p className={styles.sectionSubtitle}>
          Members, bookings, billing, trainers, and turnstiles communicate seamlessly in real time. FitCore synchronizes your entire facility through a single calm control plane.
        </p>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left: Content & Actions */}
          <div className={styles.contentCol}>
            <div className={styles.eyebrowWrap}>
              <Network className="h-4 w-4 text-primary" />
              <span className={styles.eyebrow}>OPERATIONS & HUB</span>
            </div>

            <h3 className={styles.title}>
              Unified control plane for your entire facility
            </h3>

            <p className={styles.description}>
              Members, bookings, billing, trainers, and front-desk check-ins
              meet in one calm control plane. FitCore listens to every signal and
              syncs your entire gym floor in real time.
            </p>

            <div className={styles.actions}>
              <Link
                href={isAuthed ? ROLE_HOME[user.role] : "/signup"}
                className={styles.cta}
              >
                {isAuthed ? "Go to Dashboard" : "Explore platform"}
              </Link>

              <div className={styles.statusBadge}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>6 modules in sync</span>
              </div>
            </div>
          </div>

          {/* Right: Orbital Graphic */}
          <div className={styles.graphicCol}>
            <EcosystemOrbital />
          </div>
        </div>
      </div>
    </section>
  );
}
