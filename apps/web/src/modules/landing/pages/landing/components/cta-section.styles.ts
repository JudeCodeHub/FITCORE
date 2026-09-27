export const ctaStyles = {
  // landing-contrast is deliberately theme-invariant (always dark) —
  // bg-foreground would've flipped to near-white in dark mode, turning
  // the intentional high-contrast band into a jarring bright flash.
  section: "relative overflow-hidden bg-landing-contrast py-24",
  glow:
    "pointer-events-none absolute top-1/2 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[130px]",
  inner: "relative mx-auto flex max-w-2xl flex-col items-center gap-7 px-6 text-center",
  title:
    "font-heading text-3xl font-semibold tracking-tight text-landing-contrast-foreground sm:text-4xl",
  cta: "bg-primary text-primary-foreground hover:bg-primary/90",
} as const;
