"use client";

import { useEffect, useState } from "react";
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
import { trainerProfilesService } from "@/modules/trainer-profiles/services/trainer-profiles.service";
import type {
  IMemberWithTrainer,
  ITrainerSummary,
} from "@/modules/trainer-profiles/types/trainer-profile";
import { memberAssignmentsStyles as styles } from "./member-assignments.styles";

const UNASSIGNED = "unassigned";

export function MemberAssignmentsPage() {
  const [members, setMembers] = useState<IMemberWithTrainer[]>([]);
  const [trainers, setTrainers] = useState<ITrainerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    return Promise.all([
      trainerProfilesService.listAllMembers(),
      trainerProfilesService.listAll(),
    ]).then(([nextMembers, nextTrainers]) => {
      setMembers(nextMembers);
      setTrainers(nextTrainers);
    });
  }

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, []);

  async function handleChange(member: IMemberWithTrainer, value: string) {
    setBusyId(member.id);
    try {
      if (value === UNASSIGNED) {
        if (member.assignedTrainer) {
          await trainerProfilesService.unassignMember(
            member.assignedTrainer.id,
            member.id,
          );
        }
      } else {
        await trainerProfilesService.assignMember(value, member.id);
      }
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Members</h1>
      <p className={styles.subtitle}>
        Assign each member to the trainer who works with them.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No members yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Trainer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className={styles.contactCell}>
                  {member.email}
                </TableCell>
                <TableCell className={styles.trainerCell}>
                  <Select
                    value={member.assignedTrainer?.id ?? UNASSIGNED}
                    onValueChange={(v) => handleChange(member, v ?? UNASSIGNED)}
                    disabled={busyId === member.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                      {trainers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
