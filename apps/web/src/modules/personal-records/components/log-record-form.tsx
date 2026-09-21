"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/shared/api-client/http";
import type { IExercise } from "@/modules/exercises";
import type { IPersonalRecordInput } from "@/modules/personal-records/types/personal-record";
import { logRecordFormStyles as styles } from "./log-record-form.styles";

export function LogRecordForm({
  exercises,
  onSubmit,
}: {
  exercises: IExercise[];
  onSubmit: (input: IPersonalRecordInput) => Promise<void>;
}) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        exerciseId,
        weightKg: Number(weightKg),
        reps: Number(reps),
      });
      setWeightKg("");
      setReps("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No exercises in the library yet.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="pr-exercise">Exercise</Label>
        <Select value={exerciseId} onValueChange={(v) => setExerciseId(v ?? exerciseId)}>
          <SelectTrigger id="pr-exercise">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {exercises.map((ex) => (
              <SelectItem key={ex.id} value={ex.id}>
                {ex.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={styles.field}>
        <Label htmlFor="pr-weight">Weight (kg)</Label>
        <Input
          id="pr-weight"
          type="number"
          step="0.5"
          min="0.1"
          required
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <Label htmlFor="pr-reps">Reps</Label>
        <Input
          id="pr-reps"
          type="number"
          min="1"
          required
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.submitRow}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging…" : "Log lift"}
        </Button>
      </div>
    </form>
  );
}
