"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { NAV_BY_ROLE, type UserRole } from "@/lib/nav-config";

export function AppShell({
  role,
  userName,
  title,
  activeHref,
  children,
}: {
  role: UserRole;
  userName: string;
  title?: string;
  activeHref?: string;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPage = NAV_BY_ROLE[role]
    .filter((item) => activeHref === item.href || activeHref?.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <div className="flex min-h-screen bg-[#f7f8f5] text-foreground dark:bg-background">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <Sidebar
        role={role}
        activeHref={activeHref}
        isOpen={menuOpen}
        onNavigate={() => setMenuOpen(false)}
        onClose={() => setMenuOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-70">
        <Topbar
          role={role}
          userName={userName}
          title={title ?? currentPage?.label}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-360">{children}</div>
        </main>
      </div>
    </div>
  );
}
