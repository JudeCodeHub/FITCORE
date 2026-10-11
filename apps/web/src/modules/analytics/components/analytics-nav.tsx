"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const LINKS = [
  { href: "/admin/analytics", label: "Peak Hours" },
  { href: "/admin/analytics/trainers", label: "Trainer Utilization" },
  { href: "/admin/analytics/revenue", label: "Revenue" },
  { href: "/admin/analytics/growth", label: "Growth & Churn" },
  { href: "/admin/analytics/attendance", label: "Class Attendance" },
];

export function AnalyticsNav() {
  const pathname = usePathname();

  return (
    <div className="mb-7 flex gap-2 overflow-x-auto rounded-2xl border border-black/5 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-card">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
            pathname === link.href
              ? "bg-[#17231d] text-white dark:bg-primary dark:text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
