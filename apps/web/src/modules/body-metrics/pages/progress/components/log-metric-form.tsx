"use client";

import { useState, type FormEvent } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/shared/api-client/http";
import type { IBodyMetricInput } from "@/modules/body-metrics/types/body-metric";
import { logMetricFormStyles as styles } from "./log-metric-form.styles";

function parseMeasurements(text: string): Record<string, number> | undefined {
  const entries = text
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [key, value] = pair.split(":").map((s) => s.trim());
      return [key, Number(value)] as const;
    })
    .filter(([key, value]) => key && !Number.isNaN(value));

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function LogMetricForm({
  lastKnownHeightCm,
  onSubmit,
}: {
  lastKnownHeightCm: number | null;
  onSubmit: (input: IBodyMetricInput) => Promise<void>;
}) {
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [measurementsText, setMeasurementsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        weightKg: Number(weightKg),
        heightCm: heightCm ? Number(heightCm) : undefined,
        bodyFatPct: bodyFatPct ? Number(bodyFatPct) : undefined,
        measurements: parseMeasurements(measurementsText),
      });
      setWeightKg("");
      setHeightCm("");
      setBodyFatPct("");
      setMeasurementsText("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="1"
          required
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <Label htmlFor="height">Height (cm)</Label>
        <Input
          id="height"
          type="number"
          step="0.1"
          min="50"
          placeholder={
            lastKnownHeightCm ? `Last: ${lastKnownHeightCm}` : "e.g. 178"
          }
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
        />
        <p className={styles.hint}>Leave blank to reuse your last height.</p>
      </div>

      <div className={styles.field}>
        <Label htmlFor="body-fat">Body fat %</Label>
        <Input
          id="body-fat"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={bodyFatPct}
          onChange={(e) => setBodyFatPct(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <Label htmlFor="measurements">Measurements</Label>
        <Input
          id="measurements"
          placeholder="waist:85, chest:100"
          value={measurementsText}
          onChange={(e) => setMeasurementsText(e.target.value)}
        />
      </div>

      {error && (
        <p className={cn(styles.error, styles.fullWidth)}>{error}</p>
      )}

      <div className={styles.submitRow}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging…" : "Log entry"}
        </Button>
      </div>
    </form>
  );
}
