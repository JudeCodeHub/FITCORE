import { cn } from "cn";

const ROLES = ["Admin", "Trainer", "Front Desk", "Member"];

export function RolesMockup() {
  return (
    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-7 shadow-2xl shadow-black/50 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2.5">
        {ROLES.map((role, i) => (
          <span
            key={role}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              i === 0
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "bg-white/5 border border-white/10 text-white/70",
            )}
          >
            {role}
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-3.5">
        <div className="h-3 w-full rounded-full bg-white/10" />
        <div className="h-3 w-4/5 rounded-full bg-white/10" />
        <div className="h-3 w-3/5 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
