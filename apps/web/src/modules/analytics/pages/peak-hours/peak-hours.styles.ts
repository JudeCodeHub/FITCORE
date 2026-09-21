export const peakHoursStyles = {
  title: "mb-6 font-heading text-2xl font-semibold tracking-tight",
  controls: "mb-4 flex gap-2",
  peakCard: "mb-6",
  peakText: "text-sm",
  heatmapScroll: "overflow-x-auto",
  heatmap: "grid gap-[3px]",
  cornerCell: "h-6 w-12 shrink-0",
  hourLabel:
    "flex h-6 min-w-[14px] items-end justify-center pb-1 text-[10px] leading-none text-muted-foreground",
  dayLabel: "flex h-5 w-12 shrink-0 items-center text-xs text-muted-foreground",
  cell: "h-5 min-w-[14px] rounded-sm",
} as const;
