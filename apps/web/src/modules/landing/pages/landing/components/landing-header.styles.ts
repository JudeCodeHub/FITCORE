import { cn } from "cn";

export const landingHeaderStyles = {
  wrapper: (isScrolled: boolean) =>
    cn(
      "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
      isScrolled
        ? "border-b border-border bg-background/80 backdrop-blur-md"
        : "border-b border-transparent bg-transparent",
    ),
  inner: "mx-auto flex h-16 max-w-6xl items-center justify-between px-6",
  wordmark: "font-heading text-lg font-semibold tracking-tight",
  nav: "flex items-center gap-4",
  loginLink:
    "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
  // `!` forces these over Button's baked-in `bg-primary` default variant —
  // without it, the cascade tie between two same-specificity utility
  // classes is resolved by stylesheet rule order, not by where the class
  // sits in the `class` attribute, and `bg-primary` was winning that tie.
  ctaButton:
    "!bg-landing-accent !text-landing-accent-foreground hover:!bg-landing-accent/90",
} as const;
