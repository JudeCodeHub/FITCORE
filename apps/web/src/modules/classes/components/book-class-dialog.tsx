"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/shared/api-client/http";
import type { IClass } from "@/modules/classes/types/class";
import { weeklyTimetableStyles as styles } from "./weekly-timetable.styles";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookClassDialog({
  open,
  onOpenChange,
  cls,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cls: IClass | null;
  onConfirm: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cls) return null;

  const isFull = cls.availableSeats <= 0;

  async function handleConfirm() {
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isFull ? "Join waitlist" : "Confirm booking"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 py-2">
          <div>
            <div className="font-heading text-lg font-semibold">{cls.name}</div>
            <div className="text-sm text-muted-foreground">
              {formatDateTime(cls.startTime)} – {formatDateTime(cls.endTime)}
            </div>
          </div>
          <div className={styles.dialogMetaRow}>
            <span className={styles.dialogMetaLabel}>Trainer</span>
            <span className="font-medium">{cls.trainer.name}</span>
          </div>
          <div className={styles.dialogMetaRow}>
            <span className={styles.dialogMetaLabel}>Seats open</span>
            <span className={styles.dialogMetaValue}>
              {cls.availableSeats}/{cls.capacity}
            </span>
          </div>
          {isFull && (
            <p className="text-sm text-muted-foreground">
              This class is full — you&apos;ll be added to the waitlist and
              notified if a spot opens up.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting
              ? "Confirming…"
              : isFull
                ? "Join waitlist"
                : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
