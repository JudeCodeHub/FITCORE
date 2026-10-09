"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/shared/api-client/http";
import type { IExercise } from "@/modules/exercises";
import type {
  ICreateWorkoutPlanInput,
  IUpdateWorkoutPlanInput,
  IWorkoutPlan,
} from "@/modules/workout-plans/types/workout-plan";
import { workoutPlanFormStyles as styles } from "./workout-plan-form-dialog.styles";

interface Row {
  exerciseId: string;
  sets: string;
  reps: string;
}

export function WorkoutPlanFormDialog({
  open,
  onOpenChange,
  memberId,
  exercises,
  editingPlan,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  exercises: IExercise[];
  editingPlan: IWorkoutPlan | null;
  onSubmit: (
    input: ICreateWorkoutPlanInput | IUpdateWorkoutPlanInput,
  ) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open) return;
      setError(null);
      setName(editingPlan?.name ?? "");
      setNotes(editingPlan?.notes ?? "");
      setRows(
        editingPlan
          ? editingPlan.exercises
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((e) => ({
                exerciseId: e.exerciseId,
                sets: String(e.sets),
                reps: String(e.reps),
              }))
          : exercises.length > 0
            ? [{ exerciseId: exercises[0].id, sets: "3", reps: "10" }]
            : [],
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [open, editingPlan, exercises]);

  function addRow() {
    if (exercises.length === 0) return;
    setRows((prev) => [
      ...prev,
      { exerciseId: exercises[0].id, sets: "3", reps: "10" },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const exercisesInput = rows.map((r, i) => ({
        exerciseId: r.exerciseId,
        sets: Number(r.sets),
        reps: Number(r.reps),
        order: i + 1,
      }));
      if (editingPlan) {
        await onSubmit({
          name,
          notes: notes || undefined,
          exercises: exercisesInput,
        });
      } else {
        await onSubmit({
          memberId,
          name,
          notes: notes || undefined,
          exercises: exercisesInput,
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? "Edit plan" : "New workout plan"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <Label htmlFor="plan-name">Name</Label>
            <Input
              id="plan-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <Label htmlFor="plan-notes">Notes</Label>
            <Textarea
              id="plan-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <Label>Exercises</Label>
            {exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No exercises in the library yet.
              </p>
            ) : (
              <div className={styles.rows}>
                {rows.map((row, index) => (
                  <div key={index} className={styles.row}>
                    <Select
                      value={row.exerciseId}
                      onValueChange={(v) =>
                        updateRow(index, { exerciseId: v ?? row.exerciseId })
                      }
                    >
                      <SelectTrigger className={styles.exerciseSelect}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map((ex) => (
                          <SelectItem key={ex.id} value={ex.id}>
                            {ex.name} ({ex.muscleGroup})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      className={styles.numberInput}
                      value={row.sets}
                      onChange={(e) => updateRow(index, { sets: e.target.value })}
                      aria-label="Sets"
                    />
                    <span className={styles.rowX}>×</span>
                    <Input
                      type="number"
                      min={1}
                      className={styles.numberInput}
                      value={row.reps}
                      onChange={(e) => updateRow(index, { reps: e.target.value })}
                      aria-label="Reps"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={rows.length === 1}
                      onClick={() => removeRow(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={exercises.length === 0}
            >
              + Add exercise
            </Button>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || rows.length === 0}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
