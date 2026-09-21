export const photoGridStyles = {
  grid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
  imageWrap: "aspect-square overflow-hidden rounded-t-lg bg-muted",
  image: "size-full object-cover",
  meta: "space-y-1 p-3",
  note: "truncate text-sm font-medium",
  date: "text-xs text-muted-foreground",
} as const;
