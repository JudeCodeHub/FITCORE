export const landingHeaderStyles = {
  wrapper:
    "fixed inset-x-0 top-0 z-50 w-full bg-transparent py-4 sm:py-6 pointer-events-none",
  inner: "mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 pointer-events-auto",
  pillBar:
    "mx-auto flex h-14 sm:h-16 w-full items-center justify-between rounded-2xl border border-white/15 bg-[#12131a]/70 px-4 sm:px-6 shadow-2xl backdrop-blur-xl transition-all",
  brand: "flex items-center gap-3 group transition-opacity hover:opacity-90",
  iconPlaceholder:
    "flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white transition-colors group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground",
  wordmark:
    "font-heading text-base sm:text-lg font-bold tracking-tight text-white",
  nav: "flex items-center gap-4 sm:gap-6",
  navLink:
    "text-xs sm:text-sm font-medium text-white/70 transition-colors hover:text-white",
  ctaButton:
    "inline-flex items-center justify-center rounded-full bg-white px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-black shadow-md transition-all hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98]",
} as const;
