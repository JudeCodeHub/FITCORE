export const workoutPlansListStyles = {
  list: "space-y-5",
  header: "flex items-start justify-between gap-4",
  name: "font-heading text-xl font-semibold",
  notes: "mt-1 text-sm text-muted-foreground",
  actions: "flex shrink-0 gap-2",
  exerciseList: "mt-5 space-y-3 border-t pt-5",
  exerciseRow: "flex items-center justify-between text-sm",
} as const;
