import { Area, AreaChart, ResponsiveContainer } from "recharts";

const TREND = [
  { v: 14200 },
  { v: 15100 },
  { v: 14800 },
  { v: 16400 },
  { v: 18200 },
  { v: 17900 },
  { v: 19600 },
  { v: 21300 },
  { v: 20800 },
  { v: 22700 },
  { v: 23900 },
  { v: 24850 },
];

export function MrrChartMockup() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/10 dark:shadow-black/40">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Monthly Recurring Revenue
          </p>
          <p className="font-heading text-3xl font-semibold tracking-tight">
            $24,850
          </p>
        </div>
        <span className="rounded-full bg-landing-accent/15 px-2.5 py-1 text-xs font-semibold text-landing-accent">
          +18%
        </span>
      </div>

      <div className="h-28 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TREND} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrMockupFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--landing-accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--landing-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--landing-accent)"
              strokeWidth={2.5}
              fill="url(#mrrMockupFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
