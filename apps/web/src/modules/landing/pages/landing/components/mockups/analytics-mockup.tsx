import { Bar, BarChart, ResponsiveContainer } from "recharts";

const PLAN_REVENUE = [
  { plan: "Basic", v: 3200 },
  { plan: "Plus", v: 5400 },
  { plan: "Family", v: 4100 },
  { plan: "Elite", v: 6800 },
];

export function AnalyticsMockup() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-black/5 dark:shadow-black/30">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs font-medium text-muted-foreground">
          Revenue by Plan
        </span>
        <span className="text-xs font-semibold text-landing-accent">
          ↑ 12.4%
        </span>
      </div>

      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={PLAN_REVENUE} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="v" radius={[4, 4, 0, 0]} fill="var(--landing-accent)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Churn
          </p>
          <p className="font-heading text-lg font-semibold">2.1%</p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Avg. fill rate
          </p>
          <p className="font-heading text-lg font-semibold">87%</p>
        </div>
      </div>
    </div>
  );
}
