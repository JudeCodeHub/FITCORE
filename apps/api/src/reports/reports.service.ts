import { Injectable } from '@nestjs/common';
import { CheckInsService } from '../check-ins/check-ins.service.js';
import { ClassesService } from '../classes/classes.service.js';
import { MembershipsService } from '../memberships/memberships.service.js';
import { RevenueService } from '../revenue/revenue.service.js';
import type { ReportColumn } from './csv.util.js';
import { toCsv } from './csv.util.js';
import { buildPdfReport } from './pdf.util.js';

export type ExportFormat = 'csv' | 'pdf';

export interface ExportedFile {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

interface PeakHourRow {
  day: string;
  hour: number;
  count: number;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly revenue: RevenueService,
    private readonly memberships: MembershipsService,
    private readonly classes: ClassesService,
    private readonly checkIns: CheckInsService,
  ) {}

  async buildRevenueReport(
    format: ExportFormat,
    months?: number,
  ): Promise<ExportedFile> {
    const trend = await this.revenue.getMrrTrend(months);
    const columns: ReportColumn<(typeof trend)[number]>[] = [
      { header: 'Month', value: (r) => r.month },
      { header: 'MRR', value: (r) => r.mrr },
    ];

    return this.render(format, {
      baseName: 'revenue-mrr-trend',
      title: 'Revenue - MRR Trend',
      subtitle: `Last ${trend.length} month(s)`,
      columns,
      rows: trend,
    });
  }

  async buildGrowthChurnReport(
    format: ExportFormat,
    months?: number,
  ): Promise<ExportedFile> {
    const { trend, currentActiveCount } =
      await this.memberships.getGrowthChurnTrend(months);
    const columns: ReportColumn<(typeof trend)[number]>[] = [
      { header: 'Month', value: (r) => r.month },
      { header: 'Active at Start', value: (r) => r.activeAtStart },
      { header: 'New Members', value: (r) => r.newMembers },
      { header: 'Churned Members', value: (r) => r.churnedMembers },
      { header: 'Net Growth', value: (r) => r.netGrowth },
      {
        header: 'Churn Rate %',
        value: (r) => r.churnRatePercent ?? '',
      },
    ];

    return this.render(format, {
      baseName: 'member-growth-churn',
      title: 'Member Growth & Churn',
      subtitle: `Currently ${currentActiveCount} active member(s) - last ${trend.length} month(s)`,
      columns,
      rows: trend,
    });
  }

  async buildAttendanceReport(
    format: ExportFormat,
    days?: number,
  ): Promise<ExportedFile> {
    const { classes, windowDays } =
      await this.classes.getAttendanceAnalytics(days);
    const columns: ReportColumn<(typeof classes)[number]>[] = [
      { header: 'Class', value: (r) => r.name },
      { header: 'Occurrences', value: (r) => r.occurrenceCount },
      { header: 'Capacity', value: (r) => r.totalCapacity },
      { header: 'Attended', value: (r) => r.totalAttended },
      { header: 'Waitlisted', value: (r) => r.totalWaitlisted },
      { header: 'Fill Rate %', value: (r) => r.avgFillRatePercent },
    ];

    return this.render(format, {
      baseName: 'class-attendance',
      title: 'Class Attendance',
      subtitle: `Trailing ${windowDays} days, most to least popular`,
      columns,
      rows: classes,
    });
  }

  /** Flattens the 7x24 peak-hours grid into non-zero (day, hour, count) rows,
   * busiest first — a full 168-row grid dominated by zeros isn't a useful
   * report, unlike the heatmap it's derived from. */
  async buildPeakHoursReport(
    format: ExportFormat,
    days?: number,
  ): Promise<ExportedFile> {
    const { grid, windowDays, peak } = await this.checkIns.getPeakHours(days);

    const rows: PeakHourRow[] = [];
    grid.forEach((hours, dayIndex) => {
      hours.forEach((count, hour) => {
        if (count > 0) rows.push({ day: DAY_LABELS[dayIndex], hour, count });
      });
    });
    rows.sort((a, b) => b.count - a.count);

    const columns: ReportColumn<PeakHourRow>[] = [
      { header: 'Day', value: (r) => r.day },
      { header: 'Hour', value: (r) => r.hour },
      { header: 'Check-Ins', value: (r) => r.count },
    ];

    const subtitle =
      peak.count > 0
        ? `Trailing ${windowDays} days - busiest: ${DAY_LABELS[peak.dayOfWeek]} ${peak.hourOfDay}:00 (${peak.count})`
        : `Trailing ${windowDays} days - no check-ins yet`;

    return this.render(format, {
      baseName: 'peak-hours',
      title: 'Peak Hours',
      subtitle,
      columns,
      rows,
    });
  }

  private async render<T>(
    format: ExportFormat,
    opts: {
      baseName: string;
      title: string;
      subtitle: string;
      columns: ReportColumn<T>[];
      rows: T[];
    },
  ): Promise<ExportedFile> {
    const stamp = dateStamp();

    if (format === 'csv') {
      return {
        buffer: Buffer.from(toCsv(opts.rows, opts.columns), 'utf-8'),
        contentType: 'text/csv',
        filename: `${opts.baseName}-${stamp}.csv`,
      };
    }

    const buffer = await buildPdfReport({
      title: opts.title,
      subtitle: opts.subtitle,
      columns: opts.columns,
      rows: opts.rows,
    });
    return {
      buffer,
      contentType: 'application/pdf',
      filename: `${opts.baseName}-${stamp}.pdf`,
    };
  }
}
