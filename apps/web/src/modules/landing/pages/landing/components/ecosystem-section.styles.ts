export const ecosystemStyles = {
  section: "relative mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 py-20 sm:py-32 overflow-x-clip",
  ambientGlow:
    "pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[1000px] rounded-full bg-emerald-500/5 blur-[180px]",
  headingWrap: "mx-auto max-w-3xl text-center mb-16 sm:mb-24",
  eyebrowBadge:
    "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-800 uppercase shadow-xs",
  sectionTitle:
    "mt-5 font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.1]",
  sectionSubtitle:
    "mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed",
  container:
    "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 lg:p-16 shadow-xl shadow-slate-200/40",
  grid: "relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8",
  contentCol: "lg:col-span-6 flex flex-col",
  eyebrowWrap: "flex items-center gap-2",
  eyebrow: "text-xs font-semibold tracking-widest text-emerald-700 uppercase",
  title:
    "mt-4 font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl leading-[1.12]",
  description:
    "mt-5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg",
  actions: "mt-8 flex flex-wrap items-center gap-4",
  cta: "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]",
  statusBadge:
    "inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 shadow-xs",
  graphicCol: "lg:col-span-6 flex justify-center items-center",
} as const;


