export const landingFooterStyles = {
  footer:
    "relative overflow-hidden bg-black text-white border-t border-white/10",
  inner:
    "relative z-10 mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-8",
  topGrid: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-stretch",

  // Left Column
  brandCol: "lg:col-span-5 flex flex-col justify-between",
  brandHeader: "flex items-center gap-2.5",
  logoBadge:
    "flex h-7 w-7 items-center justify-center rounded-md bg-white text-black font-black text-xs shadow-sm",
  wordmark:
    "font-heading text-sm font-bold tracking-widest text-white uppercase",
  headline:
    "mt-6 font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug",
  caption: "mt-12 text-xs text-white/50",

  // Right Boxed Grid
  boxWrapper: "lg:col-span-7",
  gridBox:
    "grid grid-cols-1 sm:grid-cols-3 border border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10 rounded-xl overflow-hidden bg-white/[0.01]",
  column: "p-6 sm:p-7 flex flex-col",
  columnTitle: "text-sm font-semibold text-white tracking-wide",
  linkList: "mt-5 flex flex-col space-y-3.5",
  link: "text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group",
  arrowIcon:
    "h-3.5 w-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all",

  // Bottom row (copyright & legal)
  bottomRow:
    "mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40",

  // Massive Watermark
  watermarkWrapper:
    "relative w-full overflow-hidden select-none pointer-events-none mt-8 -mb-4 sm:-mb-8 text-center",
  watermarkText:
    "font-heading text-[17vw] font-black tracking-tighter leading-none text-white/[0.05] whitespace-nowrap",
} as const;
