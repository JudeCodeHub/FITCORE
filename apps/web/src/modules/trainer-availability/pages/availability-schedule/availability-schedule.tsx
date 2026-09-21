"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { trainerAvailabilityService } from "@/modules/trainer-availability/services/trainer-availability.service";
import type {
  IAvailabilityInput,
  IAvailabilityWindow,
} from "@/modules/trainer-availability/types/trainer-availability";
import { AddWindowForm } from "./components/add-window-form";
import { formatMinuteLabel, WeeklyGrid } from "./components/weekly-grid";
import { availabilityScheduleStyles as styles } from "./availability-schedule.styles";

const DAY_LABELS_BY_VALUE: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

function sortWindows(windows: IAvailabilityWindow[]): IAvailabilityWindow[] {
  const displayOrder = [1, 2, 3, 4, 5, 6, 0];
  return [...windows].sort((a, b) => {
    const dayDiff =
      displayOrder.indexOf(a.dayOfWeek) - displayOrder.indexOf(b.dayOfWeek);
    return dayDiff !== 0 ? dayDiff : a.startMinute - b.startMinute;
  });
}

export function AvailabilitySchedulePage() {
  const [windows, setWindows] = useState<IAvailabilityWindow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function refresh() {
    return trainerAvailabilityService.listMine().then((data) => {
      setWindows(sortWindows(data));
    });
  }

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(input: IAvailabilityInput) {
    await trainerAvailabilityService.create(input);
    await refresh();
  }

  async function handleRemove(id: string) {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    try {
      await trainerAvailabilityService.remove(id);
    } finally {
      refresh();
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Availability</h1>
      <p className={styles.subtitle}>
        Set the hours members can book you for. Bookings outside these
        windows are blocked automatically.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className={styles.layout}>
          <WeeklyGrid windows={windows} onRemove={handleRemove} />

          <div className={styles.panel}>
            <Card>
              <CardContent className="pt-6">
                <h2 className={styles.panelTitle}>Add a window</h2>
                <div className="mt-3">
                  <AddWindowForm onSubmit={handleCreate} />
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className={styles.listTitle}>Your hours</h2>
              {windows.length === 0 ? (
                <p className={styles.listEmpty}>
                  No availability set yet — members can&apos;t book you until
                  you add at least one window.
                </p>
              ) : (
                windows.map((w) => (
                  <div key={w.id} className={styles.listRow}>
                    <span>
                      {DAY_LABELS_BY_VALUE[w.dayOfWeek]}, {formatMinuteLabel(w.startMinute)}–
                      {formatMinuteLabel(w.endMinute)}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(w.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
