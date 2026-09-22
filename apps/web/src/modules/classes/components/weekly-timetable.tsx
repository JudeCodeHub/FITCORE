"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookingsService } from "@/modules/bookings";
import type { IMyBooking } from "@/modules/bookings";
import { RatingBadge } from "@/modules/reviews";
import { classesService } from "@/modules/classes/services/classes.service";
import type { IClass } from "@/modules/classes/types/class";
import { BookClassDialog } from "./book-class-dialog";
import { weeklyTimetableStyles as styles } from "./weekly-timetable.styles";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LOW_SEATS_THRESHOLD = 3;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Weekly class schedule. Pass `trainerId` to show only one trainer's
 * classes (the trainer's own dashboard). Pass `interactive` to let the
 * viewer book/cancel their own seat directly from the grid (the member
 * timetable) — omit it for a read-only view (admin overview). */
export function WeeklyTimetable({
  trainerId,
  interactive = false,
}: {
  trainerId?: string;
  interactive?: boolean;
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [classes, setClasses] = useState<IClass[]>([]);
  const [myBookings, setMyBookings] = useState<IMyBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogClass, setDialogClass] = useState<IClass | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
      }),
    [weekStart],
  );

  function refresh() {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    setIsLoading(true);
    return Promise.all([
      classesService.list({
        from: weekStart.toISOString(),
        to: weekEnd.toISOString(),
      }),
      interactive ? bookingsService.listMine() : Promise.resolve([]),
    ])
      .then(([nextClasses, nextBookings]) => {
        setClasses(nextClasses);
        setMyBookings(nextBookings);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, interactive]);

  const visible = trainerId
    ? classes.filter((c) => c.trainerId === trainerId)
    : classes;

  const myBookingByClassId = useMemo(() => {
    const map = new Map<string, IMyBooking>();
    for (const b of myBookings) {
      if (b.status !== "CANCELLED") map.set(b.classId, b);
    }
    return map;
  }, [myBookings]);

  function classesForDay(date: Date) {
    return visible
      .filter(
        (c) => new Date(c.startTime).toDateString() === date.toDateString(),
      )
      .sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }

  async function handleCancel(bookingId: string) {
    if (!confirm("Cancel this booking?")) return;
    setBusyId(bookingId);
    try {
      await bookingsService.cancelMine(bookingId);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {trainerId ? "My Classes" : "Weekly Timetable"}
        </h1>
        <div className={styles.nav}>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setWeekStart((d) => {
                const next = new Date(d);
                next.setDate(next.getDate() - 7);
                return next;
              })
            }
          >
            ← Prev
          </Button>
          <span className={styles.rangeLabel}>
            {formatShortDate(days[0])} – {formatShortDate(days[6])}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setWeekStart((d) => {
                const next = new Date(d);
                next.setDate(next.getDate() + 7);
                return next;
              })
            }
          >
            Next →
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className={styles.grid}>
          {days.map((date, i) => (
            <Card key={date.toISOString()}>
              <CardHeader className="pb-2">
                <CardTitle className={styles.dayTitle}>
                  {DAY_LABELS[i]} {date.getDate()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {classesForDay(date).length === 0 ? (
                  <p className={styles.emptyDay}>No classes</p>
                ) : (
                  classesForDay(date).map((c) => {
                    const mine = myBookingByClassId.get(c.id);
                    const isLow =
                      c.availableSeats > 0 &&
                      c.availableSeats <= LOW_SEATS_THRESHOLD;
                    return (
                      <div key={c.id} className={styles.classCard}>
                        <div className={styles.className}>{c.name}</div>
                        <div className={styles.classMeta}>
                          {formatTime(c.startTime)}–{formatTime(c.endTime)}
                        </div>
                        <div className={styles.classMeta}>{c.trainer.name}</div>
                        <div className={isLow ? styles.seatsLow : styles.seats}>
                          {c.availableSeats}/{c.capacity} open
                        </div>
                        {c.rating.count > 0 && (
                          <RatingBadge rating={c.rating} />
                        )}

                        {interactive && (
                          <div className={styles.actionRow}>
                            {mine ? (
                              <>
                                {mine.status === "BOOKED" ? (
                                  <Badge className="bg-status-active text-status-active-foreground">
                                    Booked
                                  </Badge>
                                ) : (
                                  <Badge className="bg-status-pending text-status-pending-foreground">
                                    Waitlisted #{mine.waitlistPosition}
                                  </Badge>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    !mine.canCancel || busyId === mine.id
                                  }
                                  onClick={() => handleCancel(mine.id)}
                                >
                                  {busyId === mine.id ? "Cancelling…" : "Cancel"}
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => setDialogClass(c)}
                              >
                                {c.availableSeats > 0 ? "Book" : "Join waitlist"}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {interactive && (
        <BookClassDialog
          open={dialogClass !== null}
          onOpenChange={(open) => !open && setDialogClass(null)}
          cls={dialogClass}
          onConfirm={async () => {
            if (!dialogClass) return;
            await bookingsService.bookClass(dialogClass.id);
            await refresh();
          }}
        />
      )}
    </div>
  );
}
