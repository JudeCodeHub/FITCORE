import { cn } from "cn";

export const featuresStyles = {
  section: "mx-auto max-w-6xl px-6 py-20 sm:py-24",
  heading: "mx-auto max-w-2xl text-center",
  eyebrow:
    "text-xs font-semibold tracking-wide text-landing-accent uppercase",
  title:
    "mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl",
  rows: "mt-20 flex flex-col gap-24",
  row: (isVisible: boolean, reverse: boolean) =>
    cn(
      "grid grid-cols-1 items-center gap-10 transition-all duration-700 lg:grid-cols-2 lg:gap-16",
      reverse && "lg:[&>*:first-child]:order-2",
      isVisible
        ? "translate-y-0 opacity-100"
        : "translate-y-8 opacity-0",
    ),
  rowEyebrow:
    "text-xs font-semibold tracking-wide text-landing-accent uppercase",
  rowTitle: "mt-2 font-heading text-2xl font-semibold tracking-tight",
  rowBody: "mt-3 max-w-md text-muted-foreground",
  visual: "flex justify-center",
} as const;
