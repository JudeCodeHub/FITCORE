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
import { useAuth } from "@/shared/auth/auth-context";
import { complaintsService } from "@/modules/complaints/services/complaints.service";
import type {
  ComplaintStatus,
  IComplaint,
} from "@/modules/complaints/types/complaint";
import { ComplaintForm } from "./components/complaint-form";
import { complaintsStyles as styles } from "./complaints.styles";

const FILTERS: { value: ComplaintStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const STATUS_BADGE_CLASS: Record<ComplaintStatus, string> = {
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

export function ComplaintsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [complaints, setComplaints] = useState<IComplaint[]>([]);
  const [filter, setFilter] = useState<ComplaintStatus | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  function refresh() {
    return isAdmin
      ? complaintsService.listAll(filter === "ALL" ? undefined : filter)
          .then(setComplaints)
      : complaintsService.listMine().then(setComplaints);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      refresh().finally(() => setIsLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 0);
    return () => clearTimeout(timer);
  }, [filter, isAdmin]);

  async function handleStatusChange(
    complaint: IComplaint,
    status: ComplaintStatus,
  ) {
    await complaintsService.updateStatus(complaint.id, status);
    await refresh();
  }

  if (!user) return null;

  return (
    <div>
      <h1 className={styles.title}>
        {isAdmin ? "Complaints & Suggestions Inbox" : "Complaints & Suggestions"}
      </h1>
      <p className={styles.subtitle}>
        {isAdmin
          ? "Everything members and staff have sent in."
          : "Send a complaint or suggestion to the admin team."}
      </p>

      <Card className={styles.formCard}>
        <CardContent className="pt-6">
          <ComplaintForm
            onSubmit={async (input) => {
              await complaintsService.create(input);
              await refresh();
            }}
          />
        </CardContent>
      </Card>

      {isAdmin && (
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
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : complaints.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isAdmin ? "Nothing here." : "You haven't sent anything in yet."}
        </p>
      ) : (
        <div className={styles.list}>
          {complaints.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.typeBadgeRow}>
                      <Badge variant="outline">
                        {c.type === "SUGGESTION" ? "Suggestion" : "Complaint"}
                      </Badge>
                      {isAdmin && (
                        <span className="text-xs text-muted-foreground">
                          from {c.submittedBy.name} ({c.submittedBy.role})
                        </span>
                      )}
                    </div>
                    <div className={styles.subject}>{c.subject}</div>
                    <p className={styles.message}>{c.message}</p>
                    <p className={styles.meta}>
                      {formatDateTime(c.createdAt)}
                      {c.resolvedBy && ` · Resolved by ${c.resolvedBy.name}`}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    {isAdmin ? (
                      <Select
                        value={c.status}
                        onValueChange={(v) =>
                          handleStatusChange(
                            c,
                            (v as ComplaintStatus) ?? c.status,
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
                    ) : (
                      <Badge className={STATUS_BADGE_CLASS[c.status]}>
                        {
                          STATUS_OPTIONS.find((s) => s.value === c.status)
                            ?.label
                        }
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
