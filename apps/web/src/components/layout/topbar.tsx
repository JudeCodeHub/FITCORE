import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { ROLE_LABEL, type UserRole } from "@/lib/nav-config";
import { NotificationBell } from "@/modules/notifications";

export function Topbar({
  role,
  userName,
  title,
  onOpenMenu,
}: {
  role: UserRole;
  userName: string;
  title?: string;
  onOpenMenu?: () => void;
}) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex min-h-19 items-center justify-between gap-4 border-b border-black/5 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10 dark:border-white/10 dark:bg-background/90">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" aria-label="Open navigation" onClick={onOpenMenu} className="rounded-lg p-2 hover:bg-muted lg:hidden"><Menu className="size-5" /></button>
        <div className="min-w-0">
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:block">{ROLE_LABEL[role]} workspace</p>
          <h1 className="truncate font-heading text-lg font-semibold tracking-tight text-foreground">{title ?? ROLE_LABEL[role]}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell />
        <span className="hidden h-7 w-px bg-border sm:block" />
        <div className="hidden text-right sm:block"><p className="max-w-36 truncate text-sm font-semibold">{userName}</p><p className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</p></div>
        <Avatar className="size-9 border border-primary/15 bg-primary/10">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
