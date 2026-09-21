export const availabilityScheduleStyles = {
  title: "mb-1 font-heading text-2xl font-semibold tracking-tight",
  subtitle: "mb-6 text-sm text-muted-foreground",
  layout: "grid gap-6 lg:grid-cols-[1fr_320px]",

  gridScroll: "overflow-x-auto rounded-lg border",
  grid: "grid min-w-[640px]",
  cornerCell: "sticky left-0 z-10 border-b border-border bg-card",
  dayHeader:
    "border-b border-l border-border bg-card px-2 py-2.5 text-center font-heading text-xs font-semibold tracking-[0.08em] text-foreground uppercase",
  dayHeaderToday: "bg-accent text-accent-foreground",
  hourLabelColumn: "sticky left-0 z-10 bg-card",
  hourLabel:
    "-translate-y-1/2 pr-2 text-right font-mono text-[10px] text-muted-foreground",
  cell: "border-l border-t border-border/70",
  cellToday: "bg-accent/25",

  block:
    "group absolute inset-x-0.5 flex items-center justify-center overflow-hidden rounded-md bg-primary/90 text-[11px] font-medium text-primary-foreground shadow-sm ring-1 ring-primary/40 transition-colors hover:bg-primary",
  blockRemove:
    "absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary-foreground/35",

  panel: "space-y-4",
  panelTitle: "font-heading text-lg font-semibold",
  form: "space-y-3",
  field: "space-y-1.5",
  timeRow: "grid grid-cols-2 gap-2",
  error: "text-xs text-destructive",

  listTitle: "mt-6 mb-2 font-heading text-sm font-semibold",
  listEmpty: "text-sm text-muted-foreground",
  listRow:
    "flex items-center justify-between gap-3 border-b py-2 text-sm last:border-b-0",
} as const;
