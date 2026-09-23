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
import type { IInviteStaffInput, StaffRole } from "@/modules/staff/types/staff";
import { inviteStaffFormStyles as styles } from "./invite-staff-form.styles";

export function InviteStaffForm({
  onSubmit,
}: {
  onSubmit: (input: IInviteStaffInput) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("TRAINER");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ email, role });
      setSuccess(`Invite sent to ${email}`);
      setEmail("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="invite-email">Email</Label>
        <Input
          id="invite-email"
          type="email"
          required
          placeholder="new.staff@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <Label htmlFor="invite-role">Role</Label>
        <Select
          value={role}
          onValueChange={(v) => setRole((v as StaffRole) ?? role)}
        >
          <SelectTrigger id="invite-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TRAINER">Trainer</SelectItem>
            <SelectItem value="FRONT_DESK">Front Desk</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send invite"}
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
}
