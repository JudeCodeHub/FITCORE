"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { equipmentService } from "@/modules/equipment";
import type { IEquipment } from "@/modules/equipment";
import { maintenanceTicketsService } from "@/modules/maintenance-tickets/services/maintenance-tickets.service";
import type {
  IMaintenanceTicket,
  MaintenanceTicketStatus,
} from "@/modules/maintenance-tickets/types/maintenance-ticket";
import { useAuth } from "@/shared/auth/auth-context";
import { LogTicketForm } from "./components/log-ticket-form";
import { maintenanceTicketsStyles as styles } from "./maintenance-tickets.styles";

const FILTERS: { value: MaintenanceTicketStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const STATUS_OPTIONS: { value: MaintenanceTicketStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const STATUS_BADGE_CLASS: Record<MaintenanceTicketStatus, string> = {
  OPEN: "bg-status-pending text-status-pending-foreground",
  IN_PROGRESS: "bg-status-frozen text-status-frozen-foreground",
  RESOLVED: "bg-status-active text-status-active-foreground",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MaintenanceTicketsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [tickets, setTickets] = useState<IMaintenanceTicket[]>([]);
  const [equipment, setEquipment] = useState<IEquipment[]>([]);
  const [filter, setFilter] = useState<MaintenanceTicketStatus | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  function refresh() {
    return maintenanceTicketsService
      .list(filter === "ALL" ? undefined : filter)
      .then(setTickets);
  }

  useEffect(() => {
    equipmentService.list().then(setEquipment);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleStatusChange(
    ticket: IMaintenanceTicket,
    status: MaintenanceTicketStatus,
  ) {
    await maintenanceTicketsService.updateStatus(ticket.id, status);
    await refresh();
  }

  async function handleDelete(ticket: IMaintenanceTicket) {
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    await maintenanceTicketsService.remove(ticket.id);
    await refresh();
  }

  if (!user) return null;

  return (
    <div>
      <h1 className={styles.title}>Maintenance Tickets</h1>
      <p className={styles.subtitle}>
        Log issues with gym equipment
        {isAdmin ? " and resolve open tickets." : " for an admin to resolve."}
      </p>

      <Card className={styles.logCard}>
        <CardContent className="pt-6">
          <LogTicketForm
            equipment={equipment}
            onSubmit={async (input) => {
              await maintenanceTicketsService.create(input);
              await refresh();
            }}
          />
        </CardContent>
      </Card>

      <div className={styles.filterRow}>
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tickets here.</p>
      ) : (
        <div className={styles.list}>
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="pt-6">
                <div className={styles.ticketHeader}>
                  <div>
                    <div className={styles.equipmentName}>
                      {ticket.equipment.name}
                    </div>
                    <p className={styles.description}>{ticket.description}</p>
                    <p className={styles.meta}>
                      Reported by {ticket.reportedBy.name} on{" "}
                      {formatDateTime(ticket.createdAt)}
                      {ticket.resolvedBy &&
                        ` · Resolved by ${ticket.resolvedBy.name}`}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    {isAdmin ? (
                      <>
                        <Select
                          value={ticket.status}
                          onValueChange={(v) =>
                            handleStatusChange(
                              ticket,
                              (v as MaintenanceTicketStatus) ?? ticket.status,
                            )
                          }
                        >
                          <SelectTrigger className={styles.statusSelect}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(ticket)}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Badge className={STATUS_BADGE_CLASS[ticket.status]}>
                        {STATUS_OPTIONS.find((s) => s.value === ticket.status)
                          ?.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
