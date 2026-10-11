"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ChartNoAxesCombined, CreditCard, Settings2, Users } from "lucide-react";
import { AdminPageBanner } from "@/components/layout/admin-page-banner";
import { useAuth } from "@/shared/auth/auth-context";

const SECTIONS = [
  { href: "/admin/members", title: "Members", description: "Manage profiles and trainer assignments", icon: Users },
  { href: "/admin/payments", title: "Payments", description: "Review transactions and refunds", icon: CreditCard },
  { href: "/admin/classes", title: "Classes", description: "See the weekly class timetable", icon: CalendarDays },
  { href: "/admin/analytics", title: "Analytics", description: "Explore performance and activity", icon: ChartNoAxesCombined },
];

export function AdminHomePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div>
      <AdminPageBanner
        eyebrow="Admin workspace / Overview"
        title={`Good to see you, ${user.name.split(" ")[0]}.`}
        description="Your command center for members, classes, payments, and the numbers behind your gym."
        action={<Link href="/admin/analytics" className="inline-flex items-center gap-2 rounded-xl bg-[#5eead4] px-4 py-2.5 text-sm font-bold text-[#083a3b] transition-colors hover:bg-[#99f6e4]">View analytics <ArrowRight className="size-4" /></Link>}
      />
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Navigate</p><h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">Run your day</h2></div>
        <span className="text-xs text-muted-foreground">Your key tools, in one place</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SECTIONS.map(({ href, title, description, icon: Icon }, index) => (
          <Link key={href} href={href} className="group flex min-h-50 flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg dark:border-white/10 dark:bg-card">
            <div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-[#ccfbf1] text-[#0f766e] dark:bg-primary/15 dark:text-primary"><Icon className="size-5" /></span><span className="text-xs font-medium text-muted-foreground">0{index + 1}</span></div>
            <div className="mt-auto"><h3 className="font-heading text-lg font-semibold">{title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p></div>
            <ArrowRight className="mt-4 size-4 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
      <Link href="/admin/settings" className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white px-5 py-4 text-sm transition-colors hover:border-primary/25 dark:border-white/10 dark:bg-card"><span className="flex items-center gap-3"><Settings2 className="size-5 text-primary" /><span><strong className="block font-semibold">Workspace settings</strong><span className="text-muted-foreground">Opening hours and gym configuration</span></span></span><ArrowRight className="size-4 text-muted-foreground" /></Link>
    </div>
  );
}
