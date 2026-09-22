"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import type { IGrowthChurnSummary } from "@/modules/analytics/types/analytics";
import { growthStyles as styles } from "./growth.styles";

export function GrowthPage() {
  const [data, setData] = useState<IGrowthChurnSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getGrowthChurn(12)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  const latest = data?.trend[data.trend.length - 1];

  return (
    <div>
      <AnalyticsNav />
      <h1 className={styles.title}>Member Growth & Churn</h1>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className={styles.statRow}>
            <Card>
              <CardContent className={styles.stat}>
                <div className={styles.statValue}>
                  {data.currentActiveCount}
                </div>
                <div className={styles.statLabel}>Active members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className={styles.stat}>
                <div className={styles.statValue}>
                  {latest?.churnRatePercent === null ||
                  latest?.churnRatePercent === undefined
                    ? "—"
                    : `${latest.churnRatePercent}%`}
                </div>
                <div className={styles.statLabel}>
                  Churn rate ({latest?.month})
                </div>
              </CardContent>
            </Card>
          </div>

          <div className={styles.chartsGrid}>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  New vs Churned Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.chartBox}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.trend}
                      margin={{ top: 5, right: 12, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        stroke="var(--muted-foreground)"
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="var(--muted-foreground)"
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        dataKey="newMembers"
                        name="New"
                        fill="var(--primary)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="churnedMembers"
                        name="Churned"
                        fill="var(--destructive)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  Churn Rate Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.chartBox}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.trend}
                      margin={{ top: 5, right: 12, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        stroke="var(--muted-foreground)"
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="var(--muted-foreground)"
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        formatter={(value) => [
                          value === null ? "—" : `${value}%`,
                          "Churn rate",
                        ]}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="churnRatePercent"
                        stroke="var(--destructive)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Active at Start</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Churned</TableHead>
                <TableHead>Net Growth</TableHead>
                <TableHead>Churn Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.trend.map((p) => (
                <TableRow key={p.month}>
                  <TableCell className="font-medium">{p.month}</TableCell>
                  <TableCell className={styles.contactCell}>
                    {p.activeAtStart}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {p.newMembers}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {p.churnedMembers}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {p.netGrowth > 0 ? `+${p.netGrowth}` : p.netGrowth}
                  </TableCell>
                  <TableCell className={styles.contactCell}>
                    {p.churnRatePercent === null
                      ? "—"
                      : `${p.churnRatePercent}%`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className={styles.note}>
            Reconstructed from membership start/end dates, not a status-history
            log — a cancelled membership&apos;s stop date is estimated as the
            earlier of its plan end date and its last update, and a
            membership cancelled before it ever started isn&apos;t counted as
            churn (or as a new member).
          </p>
        </>
      )}
    </div>
  );
}
