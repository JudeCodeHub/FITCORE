export const landingFooterStyles = {
  footer:
    "relative overflow-hidden bg-slate-50 text-slate-900 border-t border-slate-200",
  inner:
    "relative z-10 mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-8",
  topGrid: "grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-stretch",

  // Left Column
  brandCol: "lg:col-span-5 flex flex-col justify-between",
  brandHeader: "flex items-center gap-2.5",
  logoBadge:
    "flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-black font-black text-xs shadow-md shadow-emerald-500/20",
  wordmark:
    "font-heading text-sm font-bold tracking-widest text-slate-950 uppercase",
  headline:
    "mt-6 font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 leading-snug",
  caption: "mt-12 text-xs text-slate-500",

  // Right Boxed Grid
  boxWrapper: "lg:col-span-7",
  gridBox:
    "grid grid-cols-1 sm:grid-cols-3 border border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs",
  column: "p-6 sm:p-7 flex flex-col",
  columnTitle: "text-sm font-semibold text-slate-900 tracking-wide",
  linkList: "mt-5 flex flex-col space-y-3.5",
  link: "text-sm text-slate-600 hover:text-emerald-600 transition-colors inline-flex items-center gap-1 group",
  arrowIcon:
    "h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all",

  // Bottom row (copyright & legal)
  bottomRow:
    "mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500",

  // Massive Watermark
  watermarkWrapper:
    "relative w-full overflow-hidden select-none pointer-events-none mt-8 -mb-4 sm:-mb-8 text-center",
  watermarkText:
    "font-heading text-[17vw] font-black tracking-tighter leading-none text-slate-900/[0.04] whitespace-nowrap",
} as const;

