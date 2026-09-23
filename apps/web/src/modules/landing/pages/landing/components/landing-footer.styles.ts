export const landingFooterStyles = {
  footer: "border-t border-border",
  inner:
    "mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between",
  brand: "text-center sm:text-left",
  wordmark: "font-heading text-base font-semibold tracking-tight",
  tagline: "mt-1 text-sm text-muted-foreground",
  links: "flex items-center gap-6 text-sm text-muted-foreground",
  link: "transition-colors hover:text-foreground",
  copyrightWrap: "mx-auto max-w-6xl px-6 pb-8",
  copyright: "text-center text-xs text-muted-foreground sm:text-left",
} as const;
