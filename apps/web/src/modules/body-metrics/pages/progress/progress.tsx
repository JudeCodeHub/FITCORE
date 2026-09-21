"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bodyMetricsService } from "@/modules/body-metrics/services/body-metrics.service";
import type { IBodyMetric } from "@/modules/body-metrics/types/body-metric";
import { PersonalRecordsSection } from "@/modules/personal-records";
import { ProgressPhotosSection } from "@/modules/progress-photos";
import { LogMetricForm } from "./components/log-metric-form";
import { MetricChart } from "./components/metric-chart";
import { progressStyles as styles } from "./progress.styles";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ProgressPage() {
  const [metrics, setMetrics] = useState<IBodyMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function refresh() {
    return bodyMetricsService.listMine().then(setMetrics);
  }

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await bodyMetricsService.remove(id);
    await refresh();
  }

  const latest = metrics[0] ?? null;
  const lastKnownHeightCm =
    metrics.find((m) => m.heightCm !== null)?.heightCm ?? null;

  const chronological = metrics.slice().reverse();
  const weightData = chronological.map((m) => ({
    date: formatDate(m.recordedAt),
    value: m.weightKg,
  }));
  const bmiData = chronological
    .filter((m) => m.bmi !== null)
    .map((m) => ({ date: formatDate(m.recordedAt), value: m.bmi as number }));
  const bodyFatData = chronological
    .filter((m) => m.bodyFatPct !== null)
    .map((m) => ({
      date: formatDate(m.recordedAt),
      value: m.bodyFatPct as number,
    }));

  return (
    <div>
      <h1 className={styles.title}>Progress</h1>

      <h2 className={styles.sectionTitle}>Body Metrics</h2>

      {!isLoading && (
        <div className={styles.statRow}>
          <Card>
            <CardContent className={styles.stat}>
              <div className={styles.statValue}>
                {latest ? `${latest.weightKg} kg` : "—"}
              </div>
              <div className={styles.statLabel}>Latest weight</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className={styles.stat}>
              <div className={styles.statValue}>
                {latest?.bmi ?? "—"}
              </div>
              <div className={styles.statLabel}>Latest BMI</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className={styles.stat}>
              <div className={styles.statValue}>
                {latest?.bodyFatPct !== null && latest?.bodyFatPct !== undefined
                  ? `${latest.bodyFatPct}%`
                  : "—"}
              </div>
              <div className={styles.statLabel}>Latest body fat</div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && metrics.length > 0 && (
        <div className={styles.chartsGrid}>
          <MetricChart title="Weight" unit="kg" data={weightData} />
          <MetricChart title="BMI" unit="" data={bmiData} />
          <MetricChart title="Body Fat %" unit="%" data={bodyFatData} />
        </div>
      )}

      <Card className={styles.logCard}>
        <CardContent className="pt-6">
          <h2 className={styles.sectionTitle}>Log a new entry</h2>
          <LogMetricForm
            lastKnownHeightCm={lastKnownHeightCm}
            onSubmit={async (input) => {
              await bodyMetricsService.create(input);
              await refresh();
            }}
          />
        </CardContent>
      </Card>

      <h2 className={styles.sectionTitle}>History</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : metrics.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No entries yet — log your first one above.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>Body Fat %</TableHead>
              <TableHead>BMI</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">
                  {formatDate(m.recordedAt)}
                </TableCell>
                <TableCell className={styles.contactCell}>
                  {m.weightKg} kg
                </TableCell>
                <TableCell className={styles.contactCell}>
                  {m.heightCm ?? "—"}
                </TableCell>
                <TableCell className={styles.contactCell}>
                  {m.bodyFatPct ?? "—"}
                </TableCell>
                <TableCell className={styles.contactCell}>
                  {m.bmi ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(m.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className={styles.divider}>
        <PersonalRecordsSection />
      </div>

      <div className={styles.divider}>
        <ProgressPhotosSection />
      </div>
    </div>
  );
}
