import { cn } from "cn";

const ROLES = ["Admin", "Trainer", "Front Desk", "Member"];

export function RolesMockup() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-black/5 dark:shadow-black/30">
      <div className="flex flex-wrap gap-2">
        {ROLES.map((role, i) => (
          <span
            key={role}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              i === 0
                ? "bg-landing-accent text-landing-accent-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {role}
          </span>
        ))}
      </div>

      <div className="mt-5 space-y-2.5">
        <div className="h-2.5 w-full rounded-full bg-muted" />
        <div className="h-2.5 w-4/5 rounded-full bg-muted" />
        <div className="h-2.5 w-3/5 rounded-full bg-muted" />
      </div>
    </div>
  );
}
