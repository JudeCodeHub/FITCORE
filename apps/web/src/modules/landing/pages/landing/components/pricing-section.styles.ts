export const pricingStyles = {
  section: "relative mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 py-24 sm:py-36 overflow-x-clip bg-[#fafafc]",
  ambientGlow:
    "pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[1000px] rounded-full bg-emerald-500/5 blur-[180px]",
  headingWrap: "mx-auto max-w-3xl text-center mb-10 sm:mb-12",
  eyebrowBadge:
    "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-800 uppercase shadow-xs",
  title:
    "mt-5 font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.1]",
  subtitle:
    "mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed",

  // Billing Toggle
  toggleWrap: "flex items-center justify-center mb-16 sm:mb-20",
  toggleContainer:
    "relative flex items-center rounded-full border border-slate-200 bg-slate-100 p-1.5 shadow-inner",
  toggleBtn: (active: boolean) =>
    `relative rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
      active
        ? "bg-white text-slate-950 shadow-md shadow-slate-200 font-semibold"
        : "text-slate-500 hover:text-slate-800"
    }`,
  saveBadge:
    "rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wide",

  // Grid of Cards
  grid: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto",

  // Card
  card: (highlighted: boolean) =>
    `relative flex flex-col justify-between rounded-3xl p-8 sm:p-10 transition-all duration-300 ${
      highlighted
        ? "border-2 border-emerald-500 bg-gradient-to-b from-emerald-50/50 via-white to-white shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/20 lg:-translate-y-3 z-10"
        : "border border-slate-200/90 bg-white shadow-lg shadow-slate-100 hover:border-slate-300 hover:shadow-xl"
    }`,

  badgeTop: (highlighted: boolean) =>
    `absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[11px] font-mono font-bold tracking-wider uppercase shadow-md ${
      highlighted
        ? "border border-emerald-300 bg-emerald-600 text-white shadow-emerald-600/20"
        : "border border-slate-200 bg-slate-100 text-slate-700 shadow-xs"
    }`,

  tierName: "font-heading text-xl font-bold text-slate-950",
  tierDescription: "mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[40px]",

  priceContainer: "mt-6 pt-6 border-t border-slate-200 flex items-baseline gap-2",
  priceCurrency: "font-heading text-2xl font-bold text-slate-500",
  priceValue: "font-heading text-5xl sm:text-6xl font-bold tracking-tight text-slate-950",
  priceCadence: "text-xs sm:text-sm text-slate-500",
  priceBilledNote: "mt-1.5 text-xs text-emerald-700 font-medium",

  featuresList: "mt-8 space-y-3.5 flex-1 border-t border-slate-200 pt-6",
  featureItem: "flex items-start gap-3 text-xs sm:text-sm text-slate-700",
  featureIcon: (highlighted: boolean) =>
    `mt-0.5 h-4 w-4 shrink-0 rounded-full p-0.5 ${
      highlighted
        ? "bg-emerald-100 text-emerald-700"
        : "bg-slate-100 text-slate-500"
    }`,

  ctaButton: (highlighted: boolean) =>
    `mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-bold transition-all duration-200 cursor-pointer ${
      highlighted
        ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98]"
        : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-xs active:scale-[0.98]"
    }`,

  // FAQ Section
  faqWrap: "mt-24 sm:mt-32 max-w-3xl mx-auto",
  faqHeading: "text-center mb-10 sm:mb-12",
  faqTitle: "font-heading text-2xl sm:text-3xl font-bold text-slate-950",
  faqSubtitle: "mt-2 text-sm text-slate-600",
  faqList: "space-y-3",
  faqItem: "rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-colors",
  faqQuestionBtn: "w-full flex items-center justify-between p-5 sm:p-6 text-left text-sm sm:text-base font-semibold text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer",
  faqAnswer: "px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4",
} as const;



