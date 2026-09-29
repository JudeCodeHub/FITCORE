export const featuresStyles = {
  section: "relative mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 py-24 sm:py-36 overflow-x-clip",
  ambientGlow:
    "pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[1000px] rounded-full bg-primary/5 blur-[180px]",
  headingWrap: "mx-auto max-w-3xl text-center mb-20 sm:mb-32",
  eyebrowBadge:
    "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase",
  title:
    "mt-5 font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]",
  subtitle:
    "mt-4 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed",

  // Open Section Rows List
  rowsList: "space-y-28 sm:space-y-36 lg:space-y-44",

  // 2-Column Row Grid
  rowGrid: "grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-20 items-center",

  // Text Column (Open and unboxed)
  textCol: (orderClass: string = "") =>
    `lg:col-span-6 flex flex-col justify-center ${orderClass}`,

  // Borderless Image Container (No boxes, no card borders, melts directly into pure black)
  imageCol: (orderClass: string = "") =>
    `relative lg:col-span-6 h-[400px] sm:h-[480px] lg:h-[560px] w-full pointer-events-none select-none overflow-hidden ${orderClass}`,

  // Image Element
  imageElement:
    "object-cover object-center scale-[1.02]",

  // Edge Fades that feather smoothly into pure black (#000000)
  edgeFadeTop:
    "pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-black via-black/80 to-transparent z-10",
  edgeFadeBottom:
    "pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-t from-black via-black/80 to-transparent z-10",
  edgeFadeLeft:
    "pointer-events-none absolute left-0 inset-y-0 w-28 sm:w-40 bg-gradient-to-r from-black via-black/80 to-transparent z-10",
  edgeFadeRight:
    "pointer-events-none absolute right-0 inset-y-0 w-28 sm:w-40 bg-gradient-to-l from-black via-black/80 to-transparent z-10",
  radialVignette:
    "pointer-events-none absolute inset-0 z-10 [background:radial-gradient(ellipse_65%_65%_at_50%_50%,transparent_30%,rgba(0,0,0,0.6)_70%,#000000_98%)]",
} as const;


