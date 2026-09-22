"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { notificationsService } from "@/modules/notifications/services/notifications.service";
import type { INotification } from "@/modules/notifications/types/notification";
import { notificationBellStyles as styles } from "./notification-bell.styles";

const POLL_INTERVAL_MS = 30_000;

function formatRelative(iso: string): string {
  const diffMinutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  function refreshCount() {
    notificationsService.unreadCount().then((r) => setUnreadCount(r.count));
  }

  function refreshList() {
    setIsLoading(true);
    return notificationsService
      .listMine()
      .then(setNotifications)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) refreshList();
  }, [open]);

  async function handleMarkRead(notification: INotification) {
    if (notification.readAt) return;
    await notificationsService.markRead(notification.id);
    await refreshList();
    refreshCount();
  }

  async function handleMarkAllRead() {
    await notificationsService.markAllRead();
    await refreshList();
    refreshCount();
  }

  async function handleDelete(notification: INotification) {
    await notificationsService.remove(notification.id);
    await refreshList();
    refreshCount();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={styles.trigger}
            aria-label="Notifications"
          />
        }
      >
        <BellIcon className="size-4" />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <div className={styles.headerRow}>
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className={styles.list}>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(styles.item, !n.readAt && styles.unreadItem)}
                onClick={() => handleMarkRead(n)}
              >
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{n.title}</span>
                  <span className={styles.itemTime}>
                    {formatRelative(n.createdAt)}
                  </span>
                </div>
                <p className={styles.itemMessage}>{n.message}</p>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n);
                  }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
