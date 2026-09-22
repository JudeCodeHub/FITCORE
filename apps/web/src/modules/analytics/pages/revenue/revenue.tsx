"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import type {
  IMrrTrendPoint,
  IRevenueSummary,
} from "@/modules/analytics/types/analytics";
import { revenueStyles as styles } from "./revenue.styles";

export function RevenuePage() {
  const [summary, setSummary] = useState<IRevenueSummary | null>(null);
  const [trend, setTrend] = useState<IMrrTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getRevenueSummary().then(setSummary),
      analyticsService.getMrrTrend(12).then(setTrend),
    ]).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <AnalyticsNav />
      <h1 className={styles.title}>Revenue</h1>

      {isLoading || !summary ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className={styles.statRow}>
            <Card>
              <CardContent className={styles.stat}>
                <div className={styles.statValue}>${summary.totalMrr}</div>
                <div className={styles.statLabel}>
                  Monthly Recurring Revenue
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className={styles.stat}>
                <div className={styles.statValue}>
                  {summary.activeMembershipCount}
                </div>
                <div className={styles.statLabel}>Active memberships</div>
              </CardContent>
            </Card>
          </div>

          <div className={styles.chartsGrid}>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  MRR Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.chartBox}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trend}
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
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        formatter={(value) => [`$${value}`, "MRR"]}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mrr"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  Revenue by Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary.byPlan.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No active memberships yet.
                  </p>
                ) : (
                  <div className={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={summary.byPlan}
                        margin={{ top: 5, right: 12, left: -12, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                        />
                        <XAxis
                          dataKey="planName"
                          tick={{ fontSize: 11 }}
                          stroke="var(--muted-foreground)"
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          stroke="var(--muted-foreground)"
                        />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "MRR"]}
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            fontSize: 12,
                          }}
                        />
                        <Bar
                          dataKey="mrr"
                          fill="var(--primary)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {summary.byPlan.length > 0 && (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Active Members</TableHead>
                  <TableHead>MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.byPlan.map((p) => (
                  <TableRow key={p.planId}>
                    <TableCell className="font-medium">
                      {p.planName}
                    </TableCell>
                    <TableCell className={styles.contactCell}>
                      {p.activeCount}
                    </TableCell>
                    <TableCell className={styles.contactCell}>
                      ${p.mrr}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <p className={styles.note}>
            MRR is derived from active membership plan prices, not real
            payment records — the actual billing system (Stripe) hasn&apos;t
            been built yet.
          </p>
        </>
      )}
    </div>
  );
}
