import Link from "next/link";
import { ArrowUpRight, Dumbbell, X } from "lucide-react";
import { NAV_BY_ROLE, ROLE_LABEL, type UserRole } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

/** Picks the most specific nav item matching the current path (e.g. on
 * "/admin/plans/5", "/admin/plans" wins over the shorter "/admin"). */
function findActiveHref(pathname: string, hrefs: string[]): string | undefined {
  const matches = hrefs.filter(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );
  return matches.sort((a, b) => b.length - a.length)[0];
}

export function Sidebar({
  role,
  activeHref,
  className,
  isOpen = false,
  onNavigate,
  onClose,
}: {
  role: UserRole;
  activeHref?: string;
  className?: string;
  isOpen?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const items = NAV_BY_ROLE[role];
  const resolvedActiveHref = activeHref
    ? findActiveHref(activeHref, items.map((item) => item.href))
    : undefined;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-70 -translate-x-full flex-col border-r border-white/10 bg-[#111b19] text-white shadow-2xl transition-transform duration-200 lg:translate-x-0 lg:shadow-none",
        isOpen && "translate-x-0",
        className,
      )}
    >
      <div className="flex h-22 items-center justify-between border-b border-white/10 px-6">
        <Link href={items[0].href} onClick={onNavigate} className="flex items-center gap-3" aria-label="FitCore home">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#c9f27a] text-[#17221b]">
            <Dumbbell className="size-5" strokeWidth={2.5} />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight">fitcore<span className="text-[#c9f27a]">.</span></span>
        </Link>
        <button type="button" aria-label="Close navigation" onClick={onClose} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden">
          <X className="size-5" />
        </button>
      </div>
      <div className="px-6 pb-3 pt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">Workspace</div>
      <nav aria-label={`${ROLE_LABEL[role]} navigation`} className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={resolvedActiveHref === item.href ? "page" : undefined}
            className={cn(
              "group flex min-h-11 items-center justify-between rounded-xl px-4 py-2.5 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/8 hover:text-white",
              resolvedActiveHref === item.href &&
                "bg-[#c9f27a] font-semibold text-[#17221b] hover:bg-[#c9f27a] hover:text-[#17221b]",
            )}
          >
            <span>{item.label}</span>
            <ArrowUpRight className={cn("size-4 opacity-0 transition-opacity group-hover:opacity-100", resolvedActiveHref === item.href && "opacity-100")} />
          </Link>
        ))}
      </nav>
      <div className="mx-4 mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c9f27a]">Your space</p>
        <p className="mt-1 font-heading text-base font-semibold">{ROLE_LABEL[role]} workspace</p>
        <p className="mt-1 text-xs leading-relaxed text-white/45">Built to keep your day moving.</p>
      </div>
    </aside>
  );
}
