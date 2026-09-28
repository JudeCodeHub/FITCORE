import { Star } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

const PROGRESS = [{ v: 62 }, { v: 68 }, { v: 65 }, { v: 74 }, { v: 80 }, { v: 86 }];

export function ReviewsMockup() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-black/5 dark:shadow-black/30">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-primary text-primary"
          />
        ))}
        <span className="ml-2 text-sm font-semibold">4.9</span>
        <span className="text-xs text-muted-foreground">(128 reviews)</span>
      </div>

      <div className="mt-4 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={PROGRESS} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
