export const notificationBellStyles = {
  trigger: "relative",
  badge:
    "absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-overdue px-1 text-[10px] font-semibold text-status-overdue-foreground",
  headerRow: "flex items-center justify-between gap-2",
  list: "flex-1 space-y-2 overflow-y-auto px-4 pb-4",
  item: "cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted",
  unreadItem: "border-primary/40 bg-accent/40",
  itemHeader: "flex items-start justify-between gap-2",
  itemTitle: "text-sm font-medium",
  itemTime: "shrink-0 text-xs text-muted-foreground",
  itemMessage: "mt-1 text-sm text-muted-foreground",
  deleteButton:
    "mt-2 text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline",
} as const;
