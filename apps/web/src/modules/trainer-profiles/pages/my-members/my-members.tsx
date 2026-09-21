"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trainerProfilesService } from "@/modules/trainer-profiles/services/trainer-profiles.service";
import type { IAssignedMember } from "@/modules/trainer-profiles/types/trainer-profile";
import { myMembersStyles as styles } from "./my-members.styles";

export function MyMembersPage() {
  const [members, setMembers] = useState<IAssignedMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    trainerProfilesService
      .listMyMembers()
      .then(setMembers)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className={styles.title}>My Members</h1>
      <p className={styles.subtitle}>
        Members the front desk or an admin has assigned to you.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No members assigned to you yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Workout Plans</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className={styles.contactCell}>
                  {member.email}
                </TableCell>
                <TableCell className={styles.contactCell}>
                  {member.phone ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/trainer/members/${member.id}/plans`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    View plans
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
