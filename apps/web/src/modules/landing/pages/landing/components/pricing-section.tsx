"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Flame,
  Crown,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { ROLE_HOME } from "@/lib/nav-config";
import { useAuth } from "@/shared/auth/auth-context";
import { pricingStyles as styles } from "./pricing-section.styles";

interface ITierConfig {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText: string;
}

const TIERS: ITierConfig[] = [
  {
    name: "Essential Access",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "Complete 24/7 floor pass, optical turnstile QR unlock, and workout logging.",
    features: [
      "Sub-second 24/7 QR Turnstile access",
      "Full strength & Olympic lifting platforms",
      "Cardio zone & luxury locker amenities",
      "FitCore Mobile App & PR tracking",
      "14 Days annual vacation freeze ($0 charged)",
    ],
    ctaText: "Get Essential Access",
  },
  {
    name: "Pro Performance",
    monthlyPrice: 79,
    annualPrice: 63,
    description: "All floor access plus unlimited HIIT studio bookings with live seat radar.",
    highlighted: true,
    badge: "MOST POPULAR",
    features: [
      "Everything in Essential Access, plus:",
      "Unlimited HIIT, Spin & Studio class bookings",
      "Real-time Studio Seat Radar with instant lock",
      "Club PR milestone celebrations & feeds",
      "30 Days annual vacation freeze ($0 charged)",
      "2 Guest passes included every month",
      "Priority drop window (48h advance booking)",
    ],
    ctaText: "Start Pro Performance",
  },
  {
    name: "Elite All-Access",
    monthlyPrice: 129,
    annualPrice: 99,
    badge: "VIP PRIVILEGE",
    description: "Luxury fitness with private recovery spa, personal coaching, and VIP perks.",
    features: [
      "Everything in Pro Performance, plus:",
      "Infrared Sauna & Cold Plunge Spa suites",
      "2 Monthly 1-on-1 Personal Trainer sessions",
      "Unlimited Vacation Freeze holds ($0 charged)",
      "FitCore Black Metal Pass & VIP Lounge",
      "Complimentary InBody composition analysis",
      "Dedicated concierge & priority booking queues",
    ],
    ctaText: "Unlock Elite All-Access",
  },
];

const FAQS = [
  {
    question: "How does the 1-Tap Vacation Freeze work?",
    answer:
      "You can freeze your membership anytime directly in the FitCore mobile app. Select your travel dates and billing pauses immediately at $0. When you return, your pass auto-reactivates without any front-desk visits.",
  },
  {
    question: "What happens when I scan my QR code at the turnstile?",
    answer:
      "Your dynamic optical QR code generates in the FitCore app and can be saved to Apple or Google Wallet. Hold it over the optical reader for an instant 0.18s unlock.",
  },
  {
    question: "Can I switch between Monthly and Annual billing later?",
    answer:
      "Yes. You can upgrade, downgrade, or switch billing cycles anytime from your account settings. Prorated credits apply automatically to your next invoice.",
  },
  {
    question: "Are studio class spots guaranteed during rush drops?",
    answer:
      "Yes. Our booking engine uses row-level database transaction locks, meaning when you claim spot #12 in our Studio Radar, it is locked immediately with zero double-booking risk.",
  },
];

export function PricingSection() {
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && user;
  const ctaHref = isAuthed ? ROLE_HOME[user.role] : "/signup";

  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="pricing" className={styles.section}>
      {/* Ambient background glow */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* Section Header */}
      <div className={styles.headingWrap}>
        <div className={styles.eyebrowBadge}>
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>TRANSPARENT PRICING</span>
        </div>

        <h2 className={styles.title}>Simple plans, zero hidden fees.</h2>

        <p className={styles.subtitle}>
          Every membership includes instant turnstile QR entry, vacation holds, and zero long-term cancellation penalties. Choose your level.
        </p>
      </div>

      {/* Segmented Billing Toggle */}
      <div className={styles.toggleWrap}>
        <div className={styles.toggleContainer}>
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={styles.toggleBtn(!isAnnual)}
          >
            Monthly Billing
          </button>

          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={styles.toggleBtn(isAnnual)}
          >
            <span>Annual Billing</span>
            <span className={styles.saveBadge}>SAVE 20%</span>
          </button>
        </div>
      </div>

      {/* 3 Pricing Cards */}
      <div className={styles.grid}>
        {TIERS.map((tier) => {
          const isHighlighted = Boolean(tier.highlighted);
          const currentPrice = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          const billedNote = isAnnual
            ? `Billed annually ($${currentPrice * 12}/yr)`
            : "Billed monthly · Cancel anytime";

          return (
            <div key={tier.name} className={styles.card(isHighlighted)}>
              {/* Optional Top Floating Badge */}
              {tier.badge && (
                <div className={styles.badgeTop(isHighlighted)}>
                  {isHighlighted ? (
                    <Flame className="h-3 w-3" />
                  ) : (
                    <Crown className="h-3 w-3 text-amber-400" />
                  )}
                  <span>{tier.badge}</span>
                </div>
              )}

              {/* Card Header */}
              <div>
                <h3 className={styles.tierName}>{tier.name}</h3>
                <p className={styles.tierDescription}>{tier.description}</p>

                {/* Price Display */}
                <div className={styles.priceContainer}>
                  <span className={styles.priceCurrency}>$</span>
                  <span className={styles.priceValue}>{currentPrice}</span>
                  <span className={styles.priceCadence}>/ month</span>
                </div>
                <p className={styles.priceBilledNote}>{billedNote}</p>
              </div>

              {/* Feature List */}
              <ul className={styles.featuresList}>
                {tier.features.map((feature, idx) => (
                  <li key={idx} className={styles.featureItem}>
                    <Check className={styles.featureIcon(isHighlighted)} />
                    <span className={feature.startsWith("Everything") ? "font-semibold text-white" : ""}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <Link href={ctaHref} className={styles.ctaButton(isHighlighted)}>
                <span>{isAuthed ? "Go to Dashboard" : tier.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions */}
      <div className={styles.faqWrap}>
        <div className={styles.faqHeading}>
          <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
          <p className={styles.faqSubtitle}>
            Everything you need to know about our memberships and access policies.
          </p>
        </div>

        <div className={styles.faqList}>
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={styles.faqItem}>
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className={styles.faqQuestionBtn}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-white/50 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && <p className={styles.faqAnswer}>{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

