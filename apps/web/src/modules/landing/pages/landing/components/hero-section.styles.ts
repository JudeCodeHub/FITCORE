export const heroStyles = {
  section:
    "relative w-full min-h-screen lg:min-h-[850px] overflow-hidden bg-black text-white flex items-center",
  backgroundImage: "object-cover object-[right_top] lg:object-[right_top]",
  overlay:
    "pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 lg:bg-gradient-to-r lg:from-black lg:via-black/90 lg:to-transparent z-0",
  inner:
    "relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16 pt-32 pb-20 sm:pt-36 sm:pb-24",
  content: "max-w-xl lg:max-w-2xl",
  headline:
    "font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]",
  subhead: "mt-6 text-sm sm:text-base text-white/75 leading-relaxed max-w-lg",
  actions: "mt-8 flex items-center gap-4",
  cta: "inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
  stats:
    "mt-14 sm:mt-16 flex flex-wrap items-start gap-8 sm:gap-14 pt-8 border-t border-white/10",
  statItem: "flex flex-col",
  statValue:
    "font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight",
  statLabel: "mt-1 text-xs text-white/60 max-w-[130px] leading-snug",
} as const;
