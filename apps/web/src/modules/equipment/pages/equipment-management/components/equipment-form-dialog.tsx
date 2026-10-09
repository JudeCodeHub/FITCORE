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
import type {
  EquipmentStatus,
  IEquipment,
  IEquipmentInput,
} from "@/modules/equipment/types/equipment";

const STATUSES: { value: EquipmentStatus; label: string }[] = [
  { value: "OPERATIONAL", label: "Operational" },
  { value: "OUT_OF_SERVICE", label: "Out of service" },
  { value: "RETIRED", label: "Retired" },
];

export function EquipmentFormDialog({
  open,
  onOpenChange,
  editingEquipment,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEquipment: IEquipment | null;
  onSubmit: (input: IEquipmentInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [status, setStatus] = useState<EquipmentStatus>("OPERATIONAL");
  const [notes, setNotes] = useState("");
  const [maintenanceIntervalDays, setMaintenanceIntervalDays] = useState("");
  const [nextMaintenanceAt, setNextMaintenanceAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open) return;
      setError(null);
      setName(editingEquipment?.name ?? "");
      setCategory(editingEquipment?.category ?? "");
      setPurchaseDate(editingEquipment?.purchaseDate?.slice(0, 10) ?? "");
      setStatus(editingEquipment?.status ?? "OPERATIONAL");
      setNotes(editingEquipment?.notes ?? "");
      setMaintenanceIntervalDays(editingEquipment?.maintenanceIntervalDays?.toString() ?? "");
      setNextMaintenanceAt(editingEquipment?.nextMaintenanceAt?.slice(0, 10) ?? "");
    }, 0);
    return () => clearTimeout(timer);
  }, [open, editingEquipment]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        category,
        purchaseDate: purchaseDate || undefined,
        status,
        notes: notes || undefined,
        maintenanceIntervalDays: maintenanceIntervalDays ? Number(maintenanceIntervalDays) : undefined,
        nextMaintenanceAt: nextMaintenanceAt ? new Date(`${nextMaintenanceAt}T00:00:00Z`).toISOString() : undefined,
      });
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
          <DialogTitle>
            {editingEquipment ? "Edit equipment" : "New equipment"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="equipment-name">Name</Label>
            <Input
              id="equipment-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="equipment-category">Category</Label>
            <Input
              id="equipment-category"
              required
              placeholder="e.g. Cardio, Strength, Free Weights"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="equipment-purchase-date">Purchase date</Label>
            <Input
              id="equipment-purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus((v as EquipmentStatus) ?? status)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="equipment-notes">Notes</Label>
            <Textarea
              id="equipment-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maintenance-interval">Maintenance interval (days)</Label>
            <Input id="maintenance-interval" type="number" min={1} max={3650} value={maintenanceIntervalDays} onChange={(e) => setMaintenanceIntervalDays(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next-maintenance">Next maintenance due</Label>
            <Input id="next-maintenance" type="date" value={nextMaintenanceAt} onChange={(e) => setNextMaintenanceAt(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
