import { Star } from "lucide-react";
import type { IRating } from "@/modules/reviews/types/review";

export function RatingBadge({ rating }: { rating: IRating }) {
  if (rating.count === 0) {
    return <span className="text-xs text-muted-foreground">No reviews yet</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
      <span className="font-medium">{rating.average}</span>
      <span className="text-xs text-muted-foreground">
        ({rating.count} review{rating.count === 1 ? "" : "s"})
      </span>
    </span>
  );
}
