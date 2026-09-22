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
    <div className="mb-6 flex gap-2">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            pathname === link.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
