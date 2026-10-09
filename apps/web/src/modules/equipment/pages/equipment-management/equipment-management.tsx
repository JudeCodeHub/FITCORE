"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { equipmentService } from "@/modules/equipment/services/equipment.service";
import type {
  IEquipment,
  IEquipmentInput,
} from "@/modules/equipment/types/equipment";
import { ApiError } from "@/shared/api-client/http";
import { EquipmentFormDialog } from "./components/equipment-form-dialog";
import { equipmentManagementStyles as styles } from "./equipment-management.styles";

const STATUS_LABEL: Record<IEquipment["status"], string> = {
  OPERATIONAL: "Operational",
  OUT_OF_SERVICE: "Out of service",
  RETIRED: "Retired",
};

const STATUS_BADGE_CLASS: Record<IEquipment["status"], string> = {
  OPERATIONAL: "bg-status-active text-status-active-foreground",
  OUT_OF_SERVICE: "bg-status-overdue text-status-overdue-foreground",
  RETIRED: "bg-status-expired text-status-expired-foreground",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EquipmentManagementPage() {
  const [equipment, setEquipment] = useState<IEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<IEquipment | null>(
    null,
  );

  async function loadEquipment() {
    setIsLoading(true);
    try {
      setEquipment(await equipmentService.list());
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load equipment",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEquipment();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function openCreateDialog() {
    setEditingEquipment(null);
    setDialogOpen(true);
  }

  function openEditDialog(item: IEquipment) {
    setEditingEquipment(item);
    setDialogOpen(true);
  }

  async function handleSubmit(input: IEquipmentInput) {
    if (editingEquipment) {
      await equipmentService.update(editingEquipment.id, input);
    } else {
      await equipmentService.create(input);
    }
    await loadEquipment();
  }

  async function handleToggleOutOfService(item: IEquipment) {
    await equipmentService.update(item.id, {
      status: item.status === "OUT_OF_SERVICE" ? "OPERATIONAL" : "OUT_OF_SERVICE",
    });
    await loadEquipment();
  }

  async function handleMaintenance(item: IEquipment) {
    const notes = prompt(`Maintenance notes for ${item.name} (optional):`);
    if (notes === null) return;
    try {
      await equipmentService.completeMaintenance(item.id, notes || undefined);
      await loadEquipment();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to record maintenance');
    }
  }

  async function handleDelete(item: IEquipment) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await equipmentService.remove(item.id);
      await loadEquipment();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete equipment");
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Equipment</h1>
          <p className={styles.subtitle}>
            Track gym equipment and flag anything out of service.
          </p>
        </div>
        <Button onClick={openCreateDialog}>New equipment</Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : equipment.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No equipment yet. Add your first item.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Purchased</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Maintenance due</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{formatDate(item.purchaseDate)}</TableCell>
                <TableCell>
                  <Badge className={STATUS_BADGE_CLASS[item.status]}>
                    {STATUS_LABEL[item.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDate(item.nextMaintenanceAt)}
                  {item.nextMaintenanceAt && new Date(item.nextMaintenanceAt) <= new Date() && <Badge className="ml-2">Due</Badge>}
                </TableCell>
                <TableCell className={styles.notesCell}>
                  {item.notes ?? "—"}
                </TableCell>
                <TableCell className={styles.actionsCell}>
                  {item.nextMaintenanceAt && item.maintenanceIntervalDays && <Button variant="outline" size="sm" onClick={() => handleMaintenance(item)}>Record maintenance</Button>}
                  {item.status !== "RETIRED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleOutOfService(item)}
                    >
                      {item.status === "OUT_OF_SERVICE"
                        ? "Mark operational"
                        : "Flag out of service"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <EquipmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingEquipment={editingEquipment}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
