export const ecosystemStyles = {
  section: "relative mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 py-20 sm:py-32 overflow-x-clip",
  ambientGlow:
    "pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[1000px] rounded-full bg-primary/5 blur-[180px]",
  headingWrap: "mx-auto max-w-3xl text-center mb-16 sm:mb-24",
  eyebrowBadge:
    "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase",
  sectionTitle:
    "mt-5 font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]",
  sectionSubtitle:
    "mt-4 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed",
  container:
    "relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 p-8 sm:p-12 lg:p-16 shadow-2xl backdrop-blur-md",
  grid: "relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8",
  contentCol: "lg:col-span-6 flex flex-col",
  eyebrowWrap: "flex items-center gap-2",
  eyebrow: "text-xs font-semibold tracking-widest text-primary uppercase",
  title:
    "mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.12]",
  description:
    "mt-5 text-sm sm:text-base text-white/70 leading-relaxed max-w-lg",
  actions: "mt-8 flex flex-wrap items-center gap-4",
  cta: "inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]",
  statusBadge:
    "inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm font-medium text-white/80 backdrop-blur-md",
  graphicCol: "lg:col-span-6 flex justify-center items-center",
} as const;

