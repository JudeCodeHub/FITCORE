"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "cn";

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayed = hovered ?? value;

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "h-5 w-5",
              star <= displayed
                ? "fill-current text-yellow-500"
                : "text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}
