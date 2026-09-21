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
import type { IAvailabilityInput } from "@/modules/trainer-availability/types/trainer-availability";
import { availabilityScheduleStyles as styles } from "../availability-schedule.styles";

const DAY_OPTIONS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function AddWindowForm({
  onSubmit,
}: {
  onSubmit: (input: IAvailabilityInput) => Promise<void>;
}) {
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const startMinute = toMinutes(startTime);
    const endMinute = toMinutes(endTime);
    if (endMinute <= startMinute) {
      setError("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ dayOfWeek: Number(dayOfWeek), startMinute, endMinute });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="availability-day">Day</Label>
        <Select
          value={dayOfWeek}
          onValueChange={(v) => setDayOfWeek(v ?? "1")}
        >
          <SelectTrigger id="availability-day">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAY_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={styles.timeRow}>
        <div className={styles.field}>
          <Label htmlFor="availability-start">Start</Label>
          <Input
            id="availability-start"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="availability-end">End</Label>
          <Input
            id="availability-end"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding…" : "Add window"}
      </Button>
    </form>
  );
}
