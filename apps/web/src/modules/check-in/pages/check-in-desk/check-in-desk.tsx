"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/shared/api-client/http";
import { checkInService } from "@/modules/check-in/services/check-in.service";
import type { ICheckIn } from "@/modules/check-in/types/check-in";
import { checkInDeskStyles as styles } from "./check-in-desk.styles";

type Feedback =
  | { kind: "success"; name: string; role: string }
  | { kind: "error"; message: string };

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CheckInDeskPage() {
  const [code, setCode] = useState("");
  const [recent, setRecent] = useState<ICheckIn[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function loadRecent() {
    checkInService.listRecent().then(setRecent);
  }

  useEffect(() => {
    loadRecent();
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await checkInService.checkIn(trimmed);
      setFeedback({
        kind: "success",
        name: result.user.name,
        role: result.user.role,
      });
      loadRecent();
    } catch (err) {
      setFeedback({
        kind: "error",
        message:
          err instanceof ApiError ? err.message : "Something went wrong",
      });
    } finally {
      setCode("");
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Check-In</h1>

      <div className={styles.grid}>
        <Card>
          <CardContent className={styles.scanCard}>
            <form onSubmit={handleSubmit} className="w-full max-w-xs">
              <Input
                ref={inputRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Scan or enter code"
                autoComplete="off"
                disabled={isSubmitting}
              />
            </form>
            <p className={styles.scanHint}>
              Scan a member&apos;s QR code or type their code and press Enter.
            </p>

            {feedback?.kind === "success" && (
              <div className="text-center">
                <p className={styles.feedbackName}>{feedback.name}</p>
                <Badge className="bg-status-active text-status-active-foreground">
                  Checked in
                </Badge>
              </div>
            )}
            {feedback?.kind === "error" && (
              <div className="text-center">
                <p className={styles.feedbackMeta}>{feedback.message}</p>
                <Badge className="bg-status-overdue text-status-overdue-foreground">
                  Not found
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className={styles.sectionTitle}>Recent Check-Ins</h2>
          <Card>
            <CardContent className="pt-6">
              {recent.length === 0 ? (
                <p className={styles.empty}>No check-ins yet today.</p>
              ) : (
                recent.map((c) => (
                  <div key={c.id} className={styles.row}>
                    <div className={styles.rowMain}>
                      <div className={styles.rowTitle}>{c.user.name}</div>
                      <div className={styles.rowMeta}>{c.user.role}</div>
                    </div>
                    <div className={styles.rowMeta}>
                      {formatTime(c.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
