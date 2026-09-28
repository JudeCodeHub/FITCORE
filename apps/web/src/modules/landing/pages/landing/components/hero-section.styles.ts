export const heroStyles = {
  section:
    "relative w-full h-[calc(100vh-4rem+1px)] sm:h-[calc(100vh-5rem+1px)] h-[calc(100dvh-4rem+1px)] sm:h-[calc(100dvh-5rem+1px)] min-h-[580px] overflow-hidden bg-black text-white flex items-center",
  imageContainer:
    "absolute top-0 right-0 h-full w-full lg:w-[64%] xl:w-[60%] overflow-hidden pointer-events-none z-0",
  backgroundImage:
    "object-cover object-[75%_15%] lg:scale-[1.08] lg:-translate-x-8 xl:scale-[1.1] xl:-translate-x-14 transition-transform duration-300",
  imageFade:
    "pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent lg:bg-gradient-to-r lg:from-black lg:via-black/35 lg:to-transparent",
  overlay:
    "pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent lg:bg-gradient-to-r lg:from-black lg:via-black/80 lg:to-transparent z-0",
  inner:
    "relative z-10 mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16",
  content: "max-w-xl lg:max-w-2xl",
  headline:
    "font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]",
  subhead: "mt-5 text-sm md:text-base text-white/75 leading-relaxed max-w-lg",
  actions: "mt-8 flex items-center gap-4",
  cta: "inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
  stats:
    "mt-12 sm:mt-14 flex flex-wrap items-start gap-8 sm:gap-14 pt-8 border-t border-white/10",
  statItem: "flex flex-col",
  statValue:
    "font-heading text-2xl  sm:text-3xl font-bold text-white tracking-tight",
  statLabel: "mt-1 text-xs text-white/60 max-w-[250px] leading-snug",
} as const;
