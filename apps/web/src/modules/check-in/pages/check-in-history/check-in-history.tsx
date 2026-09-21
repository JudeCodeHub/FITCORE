"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { checkInService } from "@/modules/check-in/services/check-in.service";
import type { ICheckInRecord } from "@/modules/check-in/types/check-in";
import { checkInHistoryStyles as styles } from "./check-in-history.styles";

function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupByDay(records: ICheckInRecord[]): [string, ICheckInRecord[]][] {
  const groups = new Map<string, ICheckInRecord[]>();
  for (const record of records) {
    const key = new Date(record.timestamp).toDateString();
    const group = groups.get(key);
    if (group) {
      group.push(record);
    } else {
      groups.set(key, [record]);
    }
  }
  return Array.from(groups.entries());
}

export function CheckInHistoryPage() {
  const [records, setRecords] = useState<ICheckInRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkInService
      .listMine()
      .then(setRecords)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const groups = groupByDay(records);

  return (
    <div>
      <h1 className={styles.title}>Check-In History</h1>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className={styles.empty}>No check-ins yet.</p>
          </CardContent>
        </Card>
      ) : (
        groups.map(([key, dayRecords]) => (
          <div key={key} className={styles.group}>
            <div className={styles.groupHeader}>
              <span className={styles.groupDay}>
                {dayLabel(new Date(dayRecords[0].timestamp))}
              </span>
              <span className={styles.groupCount}>
                {dayRecords.length} visit{dayRecords.length === 1 ? "" : "s"}
              </span>
            </div>
            <Card>
              <CardContent className="pt-4">
                {dayRecords.map((record) => (
                  <div key={record.id} className={styles.row}>
                    <span>Checked in</span>
                    <span>{formatTime(record.timestamp)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
