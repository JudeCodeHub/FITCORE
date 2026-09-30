export const pricingStyles = {
  section: "relative mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-12 py-24 sm:py-36 overflow-x-clip",
  ambientGlow:
    "pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[1000px] rounded-full bg-primary/5 blur-[180px]",
  headingWrap: "mx-auto max-w-3xl text-center mb-10 sm:mb-12",
  eyebrowBadge:
    "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase",
  title:
    "mt-5 font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]",
  subtitle:
    "mt-4 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed",

  // Billing Toggle
  toggleWrap: "flex items-center justify-center mb-16 sm:mb-20",
  toggleContainer:
    "relative flex items-center rounded-full border border-white/10 bg-zinc-950/80 p-1.5 backdrop-blur-md shadow-2xl",
  toggleBtn: (active: boolean) =>
    `relative rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
      active
        ? "bg-white text-black shadow-lg shadow-white/10"
        : "text-white/60 hover:text-white"
    }`,
  saveBadge:
    "rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide",

  // Grid of Cards
  grid: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto",

  // Card
  card: (highlighted: boolean) =>
    `relative flex flex-col justify-between rounded-3xl p-8 sm:p-10 transition-all duration-300 backdrop-blur-xl ${
      highlighted
        ? "border-2 border-primary/60 bg-gradient-to-b from-primary/[0.08] via-zinc-950/95 to-zinc-950 shadow-2xl shadow-primary/20 ring-1 ring-primary/40 lg:-translate-y-3 z-10"
        : "border border-white/10 bg-zinc-950/60 shadow-xl shadow-black/60 hover:border-white/20 hover:bg-zinc-950/80"
    }`,

  badgeTop: (highlighted: boolean) =>
    `absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[11px] font-mono font-bold tracking-wider uppercase shadow-xl ${
      highlighted
        ? "border border-primary/50 bg-primary text-primary-foreground shadow-primary/30"
        : "border border-amber-400/40 bg-zinc-900 text-amber-300 shadow-black/80"
    }`,

  tierName: "font-heading text-xl font-bold text-white",
  tierDescription: "mt-2 text-xs sm:text-sm text-white/60 leading-relaxed min-h-[40px]",

  priceContainer: "mt-6 pt-6 border-t border-white/10 flex items-baseline gap-2",
  priceCurrency: "font-heading text-2xl font-bold text-white/70",
  priceValue: "font-heading text-5xl sm:text-6xl font-bold tracking-tight text-white",
  priceCadence: "text-xs sm:text-sm text-white/50",
  priceBilledNote: "mt-1.5 text-xs text-primary font-medium",

  featuresList: "mt-8 space-y-3.5 flex-1 border-t border-white/10 pt-6",
  featureItem: "flex items-start gap-3 text-xs sm:text-sm text-white/80",
  featureIcon: (highlighted: boolean) =>
    `mt-0.5 h-4 w-4 shrink-0 rounded-full p-0.5 ${
      highlighted
        ? "bg-primary/20 text-primary"
        : "bg-white/10 text-white/80"
    }`,

  ctaButton: (highlighted: boolean) =>
    `mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-bold transition-all duration-200 cursor-pointer ${
      highlighted
        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:brightness-110 active:scale-[0.98]"
        : "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 active:scale-[0.98]"
    }`,

  // Trust Badges Grid
  trustGrid: "mt-20 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto border-t border-white/10 pt-12 sm:pt-16",
  trustItem: "flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm",
  trustIconWrap: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary",
  trustTitle: "font-heading text-sm font-bold text-white",
  trustDesc: "mt-1 text-xs text-white/60 leading-relaxed",

  // FAQ Section
  faqWrap: "mt-24 sm:mt-32 max-w-3xl mx-auto",
  faqHeading: "text-center mb-10 sm:mb-12",
  faqTitle: "font-heading text-2xl sm:text-3xl font-bold text-white",
  faqSubtitle: "mt-2 text-sm text-white/60",
  faqList: "space-y-3",
  faqItem: "rounded-2xl border border-white/10 bg-zinc-950/60 overflow-hidden transition-colors",
  faqQuestionBtn: "w-full flex items-center justify-between p-5 sm:p-6 text-left text-sm sm:text-base font-semibold text-white hover:text-primary transition-colors cursor-pointer",
  faqAnswer: "px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/5 pt-4",
} as const;


