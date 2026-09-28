export const landingHeaderStyles = {
  wrapper:
    "sticky top-0 z-50 w-full h-16 sm:h-20 bg-black border-b border-white/10 shadow-sm",
  inner:
    "mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between px-6 sm:px-8 lg:px-12",
  brand: "flex items-center gap-3 group transition-opacity hover:opacity-90",
  iconPlaceholder:
    "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 text-primary transition-colors group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground",
  wordmark: "font-heading text-xl font-bold tracking-tight text-white",
  nav: "flex items-center gap-6 sm:gap-8",
  navLink:
    "text-sm font-medium text-white/75 transition-colors hover:text-white",
  ctaButton:
    "inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
} as const;
