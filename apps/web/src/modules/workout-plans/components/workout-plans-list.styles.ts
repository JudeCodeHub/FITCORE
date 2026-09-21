export const workoutPlansListStyles = {
  list: "space-y-4",
  header: "flex items-start justify-between gap-4",
  name: "font-heading text-lg font-semibold",
  notes: "mt-1 text-sm text-muted-foreground",
  actions: "flex shrink-0 gap-2",
  exerciseList: "mt-4 space-y-2 border-t pt-4",
  exerciseRow: "flex items-center justify-between text-sm",
} as const;
