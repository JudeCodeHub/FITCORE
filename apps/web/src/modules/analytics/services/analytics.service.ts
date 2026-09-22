import { downloadReport } from "@/shared/api-client/download";
import { apiFetch } from "@/shared/api-client/http";
import type {
  IAttendanceAnalytics,
  IGrowthChurnSummary,
  IMrrTrendPoint,
  IPeakHours,
  IRevenueSummary,
  ITrainerUtilization,
} from "@/modules/analytics/types/analytics";

export type ReportExportFormat = "csv" | "pdf";

export const analyticsService = {
  getPeakHours(days?: number) {
    const query = days ? `?days=${days}` : "";
    return apiFetch<IPeakHours>(`/check-ins/peak-hours${query}`);
  },

  getTrainerUtilization(trainerId: string, days?: number) {
    const query = days ? `?days=${days}` : "";
    return apiFetch<ITrainerUtilization>(
      `/trainer-profiles/${trainerId}/utilization${query}`,
    );
  },

  getRevenueSummary() {
    return apiFetch<IRevenueSummary>("/revenue/summary");
  },

  getMrrTrend(months?: number) {
    const query = months ? `?months=${months}` : "";
    return apiFetch<IMrrTrendPoint[]>(`/revenue/mrr-trend${query}`);
  },

  getGrowthChurn(months?: number) {
    const query = months ? `?months=${months}` : "";
    return apiFetch<IGrowthChurnSummary>(
      `/memberships/growth-churn${query}`,
    );
  },

  getAttendanceAnalytics(days?: number) {
    const query = days ? `?days=${days}` : "";
    return apiFetch<IAttendanceAnalytics>(
      `/classes/attendance-analytics${query}`,
    );
  },

  exportRevenueReport(format: ReportExportFormat, months?: number) {
    const params = new URLSearchParams({ format });
    if (months) params.set("months", String(months));
    return downloadReport(`/reports/revenue?${params}`);
  },

  exportGrowthChurnReport(format: ReportExportFormat, months?: number) {
    const params = new URLSearchParams({ format });
    if (months) params.set("months", String(months));
    return downloadReport(`/reports/growth-churn?${params}`);
  },

  exportAttendanceReport(format: ReportExportFormat, days?: number) {
    const params = new URLSearchParams({ format });
    if (days) params.set("days", String(days));
    return downloadReport(`/reports/attendance?${params}`);
  },

  exportPeakHoursReport(format: ReportExportFormat, days?: number) {
    const params = new URLSearchParams({ format });
    if (days) params.set("days", String(days));
    return downloadReport(`/reports/peak-hours?${params}`);
  },
};
