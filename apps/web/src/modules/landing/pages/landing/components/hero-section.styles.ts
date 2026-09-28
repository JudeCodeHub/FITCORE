export const heroStyles = {
  section: "relative overflow-hidden pt-40 pb-28 sm:pt-48 sm:pb-36",
  glow:
    "pointer-events-none absolute top-1/2 right-[-10%] h-[32rem] w-[32rem] -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]",
  inner:
    "relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.35fr_1fr]",
  eyebrow:
    "mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase",
  headline:
    "font-heading text-[2.75rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-[4.25rem]",
  subhead: "mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground",
  actions: "mt-9 flex flex-wrap items-center gap-6",
  primaryCta:
    "bg-primary text-primary-foreground hover:bg-primary/90",
  secondaryCta:
    "text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground",
  visualWrap: "relative flex justify-center lg:justify-end",
  visualCard: "relative z-10 rotate-2 transition-transform duration-500 hover:rotate-0",
  visualChip: "absolute -bottom-8 -left-10 z-0 -rotate-6",
} as const;
