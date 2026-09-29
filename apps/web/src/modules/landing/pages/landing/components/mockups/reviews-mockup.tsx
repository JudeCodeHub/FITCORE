import { Star } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

const PROGRESS = [
  { v: 62 },
  { v: 68 },
  { v: 65 },
  { v: 74 },
  { v: 80 },
  { v: 86 },
];

export function ReviewsMockup() {
  return (
    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-7 shadow-2xl shadow-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
          <span className="ml-2 text-sm sm:text-base font-semibold text-white">4.9</span>
          <span className="text-xs sm:text-sm text-white/60">(128 reviews)</span>
        </div>
        <span className="text-xs text-primary font-medium">98% positive</span>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span>Member Retention Index</span>
          <span>+24% this quarter</span>
        </div>
        <div className="h-20 sm:h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={PROGRESS}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            >
              <Line
                type="monotone"
                dataKey="v"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
