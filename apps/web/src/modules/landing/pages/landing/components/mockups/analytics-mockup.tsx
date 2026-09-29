import { Bar, BarChart, ResponsiveContainer } from "recharts";

const PLAN_REVENUE = [
  { plan: "Basic", v: 3200 },
  { plan: "Plus", v: 5400 },
  { plan: "Family", v: 4100 },
  { plan: "Elite", v: 6800 },
];

export function AnalyticsMockup() {
  return (
    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-7 shadow-2xl shadow-black/50 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-xs sm:text-sm font-medium text-white/60">
          Revenue by Plan
        </span>
        <span className="text-xs sm:text-sm font-semibold text-primary">↑ 12.4%</span>
      </div>

      <div className="h-24 sm:h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={PLAN_REVENUE}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-[10px] sm:text-xs font-medium tracking-wider text-white/50 uppercase">
            Monthly Churn
          </p>
          <p className="font-heading text-xl sm:text-2xl font-bold text-white">2.1%</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-medium tracking-wider text-white/50 uppercase">
            Avg. fill rate
          </p>
          <p className="font-heading text-xl sm:text-2xl font-bold text-white">87%</p>
        </div>
      </div>
    </div>
  );
}
