"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exercisesService } from "@/modules/exercises";
import type { IExercise } from "@/modules/exercises";
import { personalRecordsService } from "@/modules/personal-records/services/personal-records.service";
import type { IPersonalRecord } from "@/modules/personal-records/types/personal-record";
import { personalRecordsSectionStyles as styles } from "./personal-records-section.styles";
import { LogRecordForm } from "./log-record-form";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PersonalRecordsSection() {
  const [best, setBest] = useState<IPersonalRecord[]>([]);
  const [history, setHistory] = useState<IPersonalRecord[]>([]);
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function refresh() {
    return Promise.all([
      personalRecordsService.listBest().then(setBest),
      personalRecordsService.listMine().then(setHistory),
    ]);
  }

  useEffect(() => {
    Promise.all([refresh(), exercisesService.listAll().then(setExercises)]).finally(
      () => setIsLoading(false),
    );
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await personalRecordsService.remove(id);
    await refresh();
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Personal Records</h2>

      <Card className={styles.logCard}>
        <CardContent className="pt-6">
          <LogRecordForm
            exercises={exercises}
            onSubmit={async (input) => {
              await personalRecordsService.create(input);
              await refresh();
            }}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : best.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No lifts logged yet — log one above to see your PRs.
        </p>
      ) : (
        <>
          <div className={styles.bestGrid}>
            {best.map((record) => (
              <Card key={record.exerciseId}>
                <CardContent className={styles.bestCard}>
                  <div className={styles.bestExercise}>
                    {record.exercise.name}
                  </div>
                  <div className={styles.bestLift}>
                    {record.weightKg} kg × {record.reps}
                  </div>
                  <div className={styles.bestMeta}>
                    Est. 1RM {record.estimated1RM} kg ·{" "}
                    {formatDate(record.achievedAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Exercise</TableHead>
                <TableHead>Lift</TableHead>
                <TableHead>Est. 1RM</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {formatDate(record.achievedAt)}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {record.exercise.name}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {record.weightKg} kg × {record.reps}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {record.estimated1RM} kg
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
