"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bookingsService } from "@/modules/bookings/services/bookings.service";
import type { IMyBooking } from "@/modules/bookings/types/booking";
import { ptSessionsService } from "@/modules/pt-sessions";
import type { IPtSession } from "@/modules/pt-sessions";
import { myBookingsStyles as styles } from "./my-bookings.styles";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<IMyBooking[]>([]);
  const [ptSessions, setPtSessions] = useState<IPtSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    setIsLoading(true);
    return Promise.all([bookingsService.listMine(), ptSessionsService.listMine()])
      .then(([nextBookings, nextSessions]) => {
        setBookings(nextBookings.filter((b) => b.status !== "CANCELLED"));
        setPtSessions(nextSessions);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function cancelBooking(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setBusyId(id);
    try {
      await bookingsService.cancelMine(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function cancelPtSession(id: string) {
    if (!confirm("Cancel this session?")) return;
    setBusyId(id);
    try {
      await ptSessionsService.cancelMine(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div>
      <h1 className={styles.title}>My Bookings</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Classes</h2>
        <Card>
          <CardContent className="pt-6">
            {bookings.length === 0 ? (
              <p className={styles.empty}>No upcoming class bookings.</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitle}>{b.class.name}</div>
                    <div className={styles.rowMeta}>
                      {formatDateTime(b.class.startTime)} · {b.class.trainer.name}
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    {b.status === "BOOKED" ? (
                      <Badge className="bg-status-active text-status-active-foreground">
                        Booked
                      </Badge>
                    ) : (
                      <Badge className="bg-status-pending text-status-pending-foreground">
                        Waitlisted #{b.waitlistPosition}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!b.canCancel || busyId === b.id}
                      onClick={() => cancelBooking(b.id)}
                    >
                      {busyId === b.id ? "Cancelling…" : "Cancel"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Personal Training</h2>
        <Card>
          <CardContent className="pt-6">
            {ptSessions.length === 0 ? (
              <p className={styles.empty}>No upcoming PT sessions.</p>
            ) : (
              ptSessions.map((s) => (
                <div key={s.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitle}>
                      Session with {s.trainer.name}
                    </div>
                    <div className={styles.rowMeta}>
                      {formatDateTime(s.startTime)}
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <Badge className="bg-status-active text-status-active-foreground">
                      Booked
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === s.id}
                      onClick={() => cancelPtSession(s.id)}
                    >
                      {busyId === s.id ? "Cancelling…" : "Cancel"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
