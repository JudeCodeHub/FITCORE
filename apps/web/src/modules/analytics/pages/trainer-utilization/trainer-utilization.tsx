"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsNav } from "@/modules/analytics/components/analytics-nav";
import { analyticsService } from "@/modules/analytics/services/analytics.service";
import type { ITrainerUtilization } from "@/modules/analytics/types/analytics";
import { trainerProfilesService } from "@/modules/trainer-profiles";
import type { ITrainerSummary } from "@/modules/trainer-profiles";
import { trainerUtilizationStyles as styles } from "./trainer-utilization.styles";

const WINDOW_OPTIONS = [30, 90, 365];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TrainerUtilizationPage() {
  const [trainers, setTrainers] = useState<ITrainerSummary[]>([]);
  const [trainerId, setTrainerId] = useState("");
  const [windowDays, setWindowDays] = useState(30);
  const [data, setData] = useState<ITrainerUtilization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    trainerProfilesService.listAll().then((list) => {
      setTrainers(list);
      if (list.length > 0) setTrainerId(list[0].id);
      else setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!trainerId) return;
      setIsLoading(true);
      analyticsService
        .getTrainerUtilization(trainerId, windowDays)
        .then(setData)
        .finally(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [trainerId, windowDays]);

  return (
    <div>
      <AnalyticsNav />
      <h1 className={styles.title}>Trainer Utilization</h1>

      {trainers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trainers yet.</p>
      ) : (
        <>
          <div className={styles.controls}>
            <Select
              value={trainerId}
              onValueChange={(v) => setTrainerId(v ?? "")}
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className={styles.windowButtons}>
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
          </div>

          {isLoading || !data ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div className={styles.statGrid}>
                <Card>
                  <CardContent className={styles.stat}>
                    <div className={styles.statValue}>
                      {data.sessionsRun.total}
                    </div>
                    <div className={styles.statLabel}>
                      Sessions run ({data.sessionsRun.ptSessions} PT ·{" "}
                      {data.sessionsRun.classes} classes)
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className={styles.stat}>
                    <div className={styles.statValue}>
                      {data.hours.booked}h
                    </div>
                    <div className={styles.statLabel}>Hours booked</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className={styles.stat}>
                    <div className={styles.statValue}>
                      {data.hours.available}h
                    </div>
                    <div className={styles.statLabel}>Hours available</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className={styles.stat}>
                    <div className={styles.statValue}>
                      {data.hours.utilizationPercent === null
                        ? "—"
                        : `${data.hours.utilizationPercent}%`}
                    </div>
                    <div className={styles.statLabel}>Utilization</div>
                  </CardContent>
                </Card>
              </div>

              <p className={styles.rangeNote}>
                {formatDate(data.since)} – {formatDate(data.until)}
                {data.hours.available === 0 &&
                  " · This trainer hasn't set any availability yet, so utilization can't be computed."}
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
