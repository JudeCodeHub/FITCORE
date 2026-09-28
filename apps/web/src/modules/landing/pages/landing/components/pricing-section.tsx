"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_HOME } from "@/lib/nav-config";
import { useAuth } from "@/shared/auth/auth-context";
import type { IPricingTier } from "@/modules/landing/types/landing";
import { pricingStyles as styles } from "./pricing-section.styles";

const TIERS: IPricingTier[] = [
  {
    name: "Individual",
    price: "$49",
    cadence: "/month",
    description: "Full access, billed monthly.",
    features: ["Unlimited class bookings", "Progress tracking", "Post-session reviews"],
  },
  {
    name: "Individual Annual",
    price: "$39",
    cadence: "/month, billed yearly",
    description: "Same access, better rate.",
    features: [
      "Everything in Individual",
      "Save 20% vs. monthly",
      "Priority booking window",
    ],
    highlighted: true,
  },
  {
    name: "Family & Group",
    price: "$89",
    cadence: "/month",
    description: "One membership, up to four people.",
    features: ["Everything in Individual", "Up to 4 linked members", "Shared billing"],
  },
];

export function PricingSection() {
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && user;
  const ctaHref = isAuthed ? ROLE_HOME[user.role] : "/signup";
  const ctaLabel = isAuthed ? "Go to Dashboard" : "Get Started";

  return (
    <section id="pricing" className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>Pricing</span>
        <h2 className={styles.title}>Simple plans, real flexibility</h2>
        <p className={styles.subtitle}>
          Every plan includes freeze days and a cancellation policy your
          gym actually controls — not fine print.
        </p>
      </div>

      <div className={styles.grid}>
        {TIERS.map((tier) => (
          <div key={tier.name} className={styles.card(Boolean(tier.highlighted))}>
            <p className={styles.tierName}>{tier.name}</p>
            <p className={styles.tierDescription}>{tier.description}</p>

            <div className={styles.priceRow}>
              <span className={styles.price}>{tier.price}</span>
              <span className={styles.cadence}>{tier.cadence}</span>
            </div>

            <ul className={styles.features}>
              {tier.features.map((feature) => (
                <li key={feature} className={styles.feature}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={ctaHref}
              className={buttonVariants({
                className: styles.cta(Boolean(tier.highlighted)),
                variant: tier.highlighted ? "default" : "outline",
              })}
            >
              {ctaLabel}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
