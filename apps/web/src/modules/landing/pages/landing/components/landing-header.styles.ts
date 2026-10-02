export const landingHeaderStyles = {
  wrapper:
    "sticky top-0 z-50 w-full h-16 sm:h-20 bg-black/75 backdrop-blur-xl border-b border-white/[0.08] transition-all",
  inner:
    "mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between px-6 sm:px-8 lg:px-12",
  brand: "flex items-center gap-3 group transition-opacity hover:opacity-95",
  iconPlaceholder:
    "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all group-hover:scale-105 group-hover:border-emerald-400/50",
  wordmark: "font-heading text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1",
  nav: "flex items-center gap-4 sm:gap-7",
  navLink:
    "text-sm font-medium text-white/70 transition-colors hover:text-white hover:text-emerald-400",
  ctaButton:
    "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:brightness-110 hover:scale-[1.03] active:scale-[0.98]",
} as const;
