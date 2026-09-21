"use client";

import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsService } from "@/modules/analytics/services/analytics.service";
import type { IPeakHours } from "@/modules/analytics/types/analytics";
import { peakHoursStyles as styles } from "./peak-hours.styles";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WINDOW_OPTIONS = [30, 90, 365];

function formatHour(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${period}`;
}

export function PeakHoursPage() {
  const [data, setData] = useState<IPeakHours | null>(null);
  const [windowDays, setWindowDays] = useState(90);
  const [isLoading, setIsLoading] = useState(true);

  function refresh() {
    setIsLoading(true);
    return analyticsService
      .getPeakHours(windowDays)
      .then(setData)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowDays]);

  const maxCount = data ? Math.max(1, ...data.grid.flat()) : 1;

  return (
    <div>
      <h1 className={styles.title}>Peak Hours</h1>

      <div className={styles.controls}>
        {WINDOW_OPTIONS.map((opt) => (
          <Button
            key={opt}
            size="sm"
            variant={windowDays === opt ? "default" : "outline"}
            onClick={() => setWindowDays(opt)}
          >
            Last {opt}d
          </Button>
        ))}
      </div>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <Card className={styles.peakCard}>
            <CardContent className="pt-6">
              {data.peak.count === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No check-ins in this window yet.
                </p>
              ) : (
                <p className={styles.peakText}>
                  Busiest time:{" "}
                  <strong>
                    {DAY_LABELS[data.peak.dayOfWeek]}s at{" "}
                    {formatHour(data.peak.hourOfDay)}
                  </strong>{" "}
                  — {data.peak.count} check-in
                  {data.peak.count === 1 ? "" : "s"} in the last{" "}
                  {data.windowDays} days
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Check-Ins By Day &amp; Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.heatmapScroll}>
                <div
                  className={styles.heatmap}
                  style={{ gridTemplateColumns: "auto repeat(24, 1fr)" }}
                >
                  <div className={styles.cornerCell} />
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className={styles.hourLabel}>
                      {hour % 3 === 0 ? formatHour(hour) : ""}
                    </div>
                  ))}

                  {DAY_LABELS.map((label, dayIndex) => (
                    <Fragment key={label}>
                      <div className={styles.dayLabel}>{label}</div>
                      {data.grid[dayIndex].map((count, hour) => {
                        const intensity = count / maxCount;
                        return (
                          <div
                            key={hour}
                            className={styles.cell}
                            title={`${label} ${formatHour(hour)} — ${count} check-in${count === 1 ? "" : "s"}`}
                            style={{
                              backgroundColor:
                                count === 0 ? "var(--muted)" : "var(--primary)",
                              opacity: count === 0 ? 1 : 0.25 + intensity * 0.75,
                            }}
                          />
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
