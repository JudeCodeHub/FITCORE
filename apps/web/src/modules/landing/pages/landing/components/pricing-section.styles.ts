import { cn } from "cn";

export const pricingStyles = {
  section: "mx-auto max-w-6xl px-6 py-20 sm:py-24",
  heading: "mx-auto max-w-2xl text-center",
  eyebrow: "text-xs font-semibold tracking-wide text-landing-accent uppercase",
  title:
    "mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl",
  subtitle: "mt-3 text-muted-foreground",
  grid: "mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3",
  card: (highlighted: boolean) =>
    cn(
      "flex flex-col rounded-3xl border p-7",
      highlighted
        ? "border-landing-accent bg-landing-accent/5 shadow-xl shadow-landing-accent/10"
        : "border-border bg-card",
    ),
  tierName: "font-heading text-lg font-semibold",
  tierDescription: "mt-1 text-sm text-muted-foreground",
  priceRow: "mt-6 flex items-baseline gap-1",
  price: "font-heading text-4xl font-semibold tracking-tight",
  cadence: "text-sm text-muted-foreground",
  features: "mt-6 flex flex-1 flex-col gap-2.5",
  feature: "flex items-start gap-2 text-sm",
  // `!` forces this over Button's baked-in `bg-primary` default variant —
  // see landing-header.styles.ts for why the plain override doesn't win.
  cta: (highlighted: boolean) =>
    cn(
      "mt-7",
      highlighted
        ? "!bg-landing-accent !text-landing-accent-foreground hover:!bg-landing-accent/90"
        : "",
    ),
} as const;
