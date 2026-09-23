export const ctaStyles = {
  // landing-contrast is deliberately theme-invariant (always dark) —
  // bg-foreground would've flipped to near-white in dark mode, turning
  // the intentional high-contrast band into a jarring bright flash.
  section: "relative overflow-hidden bg-landing-contrast py-24",
  glow:
    "pointer-events-none absolute top-1/2 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-accent/25 blur-[130px]",
  inner: "relative mx-auto flex max-w-2xl flex-col items-center gap-7 px-6 text-center",
  title:
    "font-heading text-3xl font-semibold tracking-tight text-landing-contrast-foreground sm:text-4xl",
  // `!` forces this over Button's baked-in `bg-primary` default variant —
  // see landing-header.styles.ts for why the plain override doesn't win.
  cta: "!bg-landing-accent !text-landing-accent-foreground hover:!bg-landing-accent/90",
} as const;
