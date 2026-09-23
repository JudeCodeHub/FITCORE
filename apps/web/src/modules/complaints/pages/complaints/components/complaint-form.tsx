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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/shared/api-client/http";
import type {
  ComplaintType,
  ICreateComplaintInput,
} from "@/modules/complaints/types/complaint";
import { complaintFormStyles as styles } from "./complaint-form.styles";

export function ComplaintForm({
  onSubmit,
}: {
  onSubmit: (input: ICreateComplaintInput) => Promise<void>;
}) {
  const [type, setType] = useState<ComplaintType>("SUGGESTION");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ type, subject, message });
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="complaint-type">Type</Label>
        <Select
          value={type}
          onValueChange={(v) => setType((v as ComplaintType) ?? type)}
        >
          <SelectTrigger id="complaint-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SUGGESTION">Suggestion</SelectItem>
            <SelectItem value="COMPLAINT">Complaint</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.field}>
        <Label htmlFor="complaint-subject">Subject</Label>
        <Input
          id="complaint-subject"
          required
          placeholder="A short summary"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className={styles.fieldWide}>
        <Label htmlFor="complaint-message">Details</Label>
        <Textarea
          id="complaint-message"
          required
          rows={3}
          placeholder="Tell us more…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className={styles.fieldWide}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send to admin"}
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
