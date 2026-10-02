export const heroStyles = {
  section:
    "relative w-full min-h-[calc(100vh-4rem+1px)] sm:min-h-[calc(100vh-5rem+1px)] overflow-hidden bg-[#fafafc] text-slate-900 flex items-center pt-8 pb-16 sm:py-20",
  ambientGlow:
    "pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[140px] z-0",
  imageContainer:
    "absolute top-0 right-0 h-full w-full lg:w-[64%] xl:w-[60%] overflow-hidden pointer-events-none z-0",
  backgroundImage:
    "object-cover object-[75%_15%] lg:scale-[1.08] lg:-translate-x-8 xl:scale-[1.1] xl:-translate-x-14 transition-transform duration-700 opacity-80",
  imageFade:
    "pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#fafafc] via-[#fafafc]/70 to-transparent lg:bg-gradient-to-r lg:from-[#fafafc] lg:via-[#fafafc]/60 lg:to-transparent",
  overlay:
    "pointer-events-none absolute inset-0 bg-gradient-to-t from-[#fafafc] via-[#fafafc]/80 to-transparent lg:bg-gradient-to-r lg:from-[#fafafc] lg:via-[#fafafc]/75 lg:to-transparent z-0",
  inner:
    "relative z-10 mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12",
  content: "max-w-xl lg:max-w-2xl",
  badge:
    "inline-flex items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm mb-6",
  headline:
    "font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08]",
  headlineGradient:
    "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
  subhead:
    "mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg font-normal",
  actions: "mt-8 flex flex-wrap items-center gap-4",
  primaryBtn:
    "inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-200 hover:brightness-110 hover:scale-[1.03] active:scale-[0.98]",

  secondaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]",
  pulsePill:
    "mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-md px-3.5 py-2 text-xs text-slate-700 shadow-xs",
  stats:
    "mt-10 sm:mt-12 flex flex-wrap items-start gap-8 sm:gap-14 pt-8 border-t border-slate-200",
  statItem: "flex flex-col",
  statValue:
    "font-heading text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight",
  statLabel: "mt-1 text-xs text-slate-500 max-w-[250px] leading-snug",
} as const;

