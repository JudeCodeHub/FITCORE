"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/shared/api-client/http";
import { settingsService } from "@/modules/settings/services/settings.service";
import type { IHours } from "@/modules/settings/types/settings";
import { HoursEditor } from "./components/hours-editor";
import { settingsStyles as styles } from "./settings.styles";

export function SettingsPage() {
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [hours, setHours] = useState<IHours | null>(null);
  const [branchesText, setBranchesText] = useState("");
  const [freezeDaysPerYearLimit, setFreezeDaysPerYearLimit] = useState(0);
  const [cancellationNoticeDays, setCancellationNoticeDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    settingsService
      .get()
      .then((settings) => {
        setName(settings.name);
        setTimezone(settings.timezone);
        setHours(settings.hours);
        setBranchesText(settings.branches.join(", "));
        setFreezeDaysPerYearLimit(settings.freezeDaysPerYearLimit);
        setCancellationNoticeDays(settings.cancellationNoticeDays);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!hours) return;
    setError(null);
    setIsSaving(true);
    try {
      await settingsService.update({
        name,
        timezone,
        hours,
        branches: branchesText
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean),
        freezeDaysPerYearLimit,
        cancellationNoticeDays,
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !hours) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div>
      <h1 className={styles.title}>Settings</h1>
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle className={styles.sectionTitle}>Gym Profile</CardTitle>
            <p className={styles.sectionSubtitle}>
              Shown wherever the gym&apos;s identity or location matters.
            </p>
          </CardHeader>
          <CardContent className={styles.fieldRow}>
            <div className={styles.field}>
              <Label htmlFor="gym-name">Gym name</Label>
              <Input
                id="gym-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="gym-timezone">Timezone</Label>
              <Input
                id="gym-timezone"
                placeholder="e.g. America/New_York"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
            <div className={`${styles.field} sm:col-span-2`}>
              <Label htmlFor="gym-branches">Branches</Label>
              <Input
                id="gym-branches"
                placeholder="Downtown, Uptown"
                value={branchesText}
                onChange={(e) => setBranchesText(e.target.value)}
              />
              <p className={styles.hint}>
                Comma-separated. Leave blank for a single location.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle className={styles.sectionTitle}>Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <HoursEditor hours={hours} onChange={setHours} />
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle className={styles.sectionTitle}>
              Cancellation & Freeze Policy
            </CardTitle>
            <p className={styles.sectionSubtitle}>
              These limits are enforced everywhere memberships are frozen
              or cancelled.
            </p>
          </CardHeader>
          <CardContent className={styles.fieldRow}>
            <div className={styles.field}>
              <Label htmlFor="freeze-limit">Freeze days allowed per year</Label>
              <Input
                id="freeze-limit"
                type="number"
                min={0}
                max={365}
                value={freezeDaysPerYearLimit}
                onChange={(e) =>
                  setFreezeDaysPerYearLimit(Number(e.target.value))
                }
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="notice-days">
                Cancellation notice required (days)
              </Label>
              <Input
                id="notice-days"
                type="number"
                min={0}
                max={365}
                value={cancellationNoticeDays}
                onChange={(e) =>
                  setCancellationNoticeDays(Number(e.target.value))
                }
              />
              <p className={styles.hint}>
                0 means members can cancel an active membership any time.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save settings"}
          </Button>
          {justSaved && <span className={styles.savedNote}>Saved</span>}
        </div>
      </form>
    </div>
  );
}
