export const heroStyles = {
  section: "relative overflow-hidden pt-40 pb-28 sm:pt-48 sm:pb-36",
  glow:
    "pointer-events-none absolute top-1/2 right-[-10%] h-[32rem] w-[32rem] -translate-y-1/2 rounded-full bg-landing-accent/20 blur-[120px]",
  inner:
    "relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.35fr_1fr]",
  eyebrow:
    "mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-landing-accent/30 bg-landing-accent/10 px-3 py-1 text-xs font-semibold tracking-wide text-landing-accent uppercase",
  headline:
    "font-heading text-[2.75rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-[4.25rem]",
  subhead: "mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground",
  actions: "mt-9 flex flex-wrap items-center gap-6",
  // `!` forces this over Button's baked-in `bg-primary` default variant —
  // see landing-header.styles.ts for why the plain override doesn't win.
  primaryCta:
    "!bg-landing-accent !text-landing-accent-foreground hover:!bg-landing-accent/90",
  secondaryCta:
    "text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground",
  visualWrap: "relative flex justify-center lg:justify-end",
  visualCard: "relative z-10 rotate-2 transition-transform duration-500 hover:rotate-0",
  visualChip: "absolute -bottom-8 -left-10 z-0 -rotate-6",
} as const;
