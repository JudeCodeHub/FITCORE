import { cn } from "cn";

export const pricingStyles = {
  section: "mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 py-24 sm:py-32",
  heading: "mx-auto max-w-2xl text-center",
  eyebrow: "text-xs font-semibold tracking-wide text-primary uppercase",
  title: "mt-3 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl",
  subtitle: "mt-3 text-white/70 max-w-xl mx-auto",
  grid: "mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3",
  card: (highlighted: boolean) =>
    cn(
      "flex flex-col rounded-3xl border p-7 transition-all duration-300",
      highlighted
        ? "border-primary bg-primary/10 shadow-2xl shadow-primary/15 relative ring-1 ring-primary/40"
        : "border-white/10 bg-zinc-900/60 shadow-xl shadow-black/40 backdrop-blur-sm hover:border-white/20",
    ),
  tierName: "font-heading text-lg font-semibold text-white",
  tierDescription: "mt-1 text-sm text-white/60",
  priceRow: "mt-6 flex items-baseline gap-1",
  price: "font-heading text-4xl font-semibold tracking-tight text-white",
  cadence: "text-sm text-white/60",
  features: "mt-6 flex flex-1 flex-col gap-2.5",
  feature: "flex items-start gap-2 text-sm text-white/80",
  cta: (highlighted: boolean) =>
    cn(
      "mt-7 w-full py-2.5 font-semibold transition-all",
      highlighted
        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
        : "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30",
    ),
} as const;

