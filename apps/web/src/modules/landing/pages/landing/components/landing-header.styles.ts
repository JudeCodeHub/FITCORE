export const landingHeaderStyles = {
  wrapper:
    "sticky top-0 z-50 w-full h-16 sm:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]",
  inner:
    "mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between px-6 sm:px-8 lg:px-12",
  brand: "flex items-center gap-3 group transition-opacity hover:opacity-95",
  iconPlaceholder:
    "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-black shadow-md shadow-emerald-500/20 transition-all group-hover:scale-105",
  wordmark:
    "font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-1",
  nav: "flex items-center gap-4 sm:gap-7",
  navLink:
    "text-sm font-medium text-slate-600 transition-colors hover:text-emerald-600",
  ctaButton:
    "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all hover:brightness-110 hover:scale-[1.03] active:scale-[0.98]",
} as const;


