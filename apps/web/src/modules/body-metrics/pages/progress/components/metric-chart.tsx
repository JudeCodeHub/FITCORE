"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { metricChartStyles as styles } from "./metric-chart.styles";

interface MetricPoint {
  date: string;
  value: number;
}

export function MetricChart({
  title,
  unit,
  data,
}: {
  title: string;
  unit: string;
  data: MetricPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.title}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length < 2 ? (
          <p className={styles.empty}>Log at least 2 entries to see a trend.</p>
        ) : (
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value) => [`${value}${unit}`, title]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
