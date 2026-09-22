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
import type { IEquipment } from "@/modules/equipment";
import type { ICreateMaintenanceTicketInput } from "@/modules/maintenance-tickets/types/maintenance-ticket";
import { logTicketFormStyles as styles } from "./log-ticket-form.styles";

export function LogTicketForm({
  equipment,
  onSubmit,
}: {
  equipment: IEquipment[];
  onSubmit: (input: ICreateMaintenanceTicketInput) => Promise<void>;
}) {
  const [equipmentId, setEquipmentId] = useState(equipment[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ equipmentId, description });
      setDescription("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (equipment.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No equipment in inventory yet — an admin needs to add some first.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="ticket-equipment">Equipment</Label>
        <Select
          value={equipmentId}
          onValueChange={(v) => setEquipmentId(v ?? equipmentId)}
        >
          <SelectTrigger id="ticket-equipment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {equipment.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={styles.field}>
        <Label htmlFor="ticket-description">What&apos;s wrong?</Label>
        <Input
          id="ticket-description"
          required
          placeholder="e.g. Belt is squeaking loudly"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex items-end">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Logging…" : "Log issue"}
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
