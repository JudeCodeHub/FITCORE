export const featuresStyles = {
  section: "relative mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 py-24 sm:py-36 overflow-x-clip",
  ambientGlow:
    "pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[1000px] rounded-full bg-emerald-500/5 blur-[180px]",
  headingWrap: "mx-auto max-w-3xl text-center mb-20 sm:mb-28",
  eyebrowBadge:
    "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-800 uppercase shadow-xs",
  title:
    "mt-5 font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.1]",
  subtitle:
    "mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed",

  // Open Section Rows List
  rowsList: "space-y-24 sm:space-y-32 lg:space-y-40",

  // 2-Column Row Grid
  rowGrid: "grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-20 items-center",

  // Text Column (Open and unboxed)
  textCol: (orderClass: string = "") =>
    `lg:col-span-6 flex flex-col justify-center ${orderClass}`,

  // Image Container framed in refined rounded shadow card
  imageCol: (orderClass: string = "") =>
    `relative lg:col-span-6 h-[400px] sm:h-[480px] lg:h-[540px] w-full select-none overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-xl shadow-slate-200/50 ${orderClass}`,

  // Image Element
  imageElement:
    "object-cover object-center scale-[1.02] transition-transform duration-700 hover:scale-[1.05]",

  // Subtle clean edge overlays
  edgeFadeTop:
    "pointer-events-none absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/10 to-transparent z-10",
  edgeFadeBottom:
    "pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/25 to-transparent z-10",
  edgeFadeLeft: "pointer-events-none absolute left-0 inset-y-0 w-8 bg-transparent z-10",
  edgeFadeRight: "pointer-events-none absolute right-0 inset-y-0 w-8 bg-transparent z-10",
  radialVignette: "pointer-events-none absolute inset-0 z-10",
} as const;



