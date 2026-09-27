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
  ctaButton:
    "bg-primary text-primary-foreground hover:bg-primary/90",
} as const;
