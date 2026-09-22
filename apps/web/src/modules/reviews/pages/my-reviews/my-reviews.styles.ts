export const myReviewsStyles = {
  title: "mb-6 font-heading text-2xl font-semibold tracking-tight",
  section: "mb-8",
  sectionTitle: "mb-3 font-heading text-lg font-semibold",
  row: "flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
  rowMain: "min-w-0",
  rowTitle: "truncate font-medium",
  rowMeta: "text-sm text-muted-foreground",
  rowActions: "flex shrink-0 flex-col items-start gap-2 sm:items-end",
  empty: "text-sm text-muted-foreground",
  comment: "mt-1 text-sm italic text-muted-foreground",
  submitRow: "flex items-center gap-2",
} as const;
