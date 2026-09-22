"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnalyticsNav } from "@/modules/analytics/components/analytics-nav";
import { analyticsService } from "@/modules/analytics/services/analytics.service";
import type { IAttendanceAnalytics } from "@/modules/analytics/types/analytics";
import { attendanceStyles as styles } from "./attendance.styles";

export function AttendancePage() {
  const [data, setData] = useState<IAttendanceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getAttendanceAnalytics(90)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <AnalyticsNav />
      <h1 className={styles.title}>Class Attendance</h1>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : data.classes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No classes concluded in the last {data.windowDays} days.
        </p>
      ) : (
        <>
          <div className={styles.statRow}>
            <Card>
              <CardContent className={styles.stat}>
                <div className={styles.statSub}>
                  {data.mostPopular?.name}
                </div>
                <div className={styles.statValue}>
                  {data.mostPopular?.avgFillRatePercent}%
                </div>
                <div className={styles.statLabel}>Most popular (fill rate)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className={styles.stat}>
                <div className={styles.statSub}>
                  {data.leastPopular?.name}
                </div>
                <div className={styles.statValue}>
                  {data.leastPopular?.avgFillRatePercent}%
                </div>
                <div className={styles.statLabel}>
                  Least popular (fill rate)
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Fill Rate by Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.classes}
                    margin={{ top: 5, right: 12, left: -12, bottom: 24 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="var(--muted-foreground)"
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="var(--muted-foreground)"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Fill rate"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="avgFillRatePercent"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Occurrences</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Attended</TableHead>
                <TableHead>Waitlisted</TableHead>
                <TableHead>Fill Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.classes.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className={styles.contactCell}>
                    {c.occurrenceCount}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {c.totalCapacity}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {c.totalAttended}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {c.totalWaitlisted}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {c.avgFillRatePercent}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className={styles.note}>
            Classes grouped by name, over the trailing {data.windowDays} days.
            &quot;Attended&quot; is BOOKED seats on classes that have already
            concluded — there&apos;s no separate check-in record tied to a
            class, so this is the best available proxy. Waitlisted bookings
            never held a seat and are shown separately, not counted toward
            fill rate.
          </p>
        </>
      )}
    </div>
  );
}
