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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/shared/api-client/http";
import { useAuth } from "@/shared/auth/auth-context";
import { staffService } from "@/modules/staff/services/staff.service";
import type { IStaffMember, StaffRole } from "@/modules/staff/types/staff";
import { InviteStaffForm } from "./components/invite-staff-form";
import { staffStyles as styles } from "./staff.styles";

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "TRAINER", label: "Trainer" },
  { value: "FRONT_DESK", label: "Front Desk" },
];

export function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<IStaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    return staffService.list().then(setStaff);
  }

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, []);

  async function handleRoleChange(member: IStaffMember, role: StaffRole) {
    setError(null);
    setBusyId(member.id);
    try {
      await staffService.updateRole(member.id, role);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleActive(member: IStaffMember) {
    setError(null);
    setBusyId(member.id);
    try {
      if (member.isActive) {
        await staffService.deactivate(member.id);
      } else {
        await staffService.reactivate(member.id);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Staff</h1>
      <p className={styles.subtitle}>
        Invite staff, change roles, and deactivate accounts.
      </p>

      <Card className={styles.formCard}>
        <CardContent className="pt-6">
          <InviteStaffForm
            onSubmit={async (input) => {
              await staffService.invite(input);
            }}
          />
        </CardContent>
      </Card>

      {error && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.name}
                  {member.id === user?.id && (
                    <span className={styles.youNote}>(you)</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell>
                  <Select
                    value={member.role}
                    onValueChange={(v) =>
                      handleRoleChange(member, (v as StaffRole) ?? member.role)
                    }
                  >
                    <SelectTrigger
                      className={styles.roleSelect}
                      disabled={busyId === member.id}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      member.isActive
                        ? "bg-status-active text-status-active-foreground"
                        : "bg-status-pending text-status-pending-foreground"
                    }
                  >
                    {member.isActive ? "Active" : "Deactivated"}
                  </Badge>
                </TableCell>
                <TableCell className={styles.actions}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyId === member.id}
                    onClick={() => handleToggleActive(member)}
                  >
                    {member.isActive ? "Deactivate" : "Reactivate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
