import { apiFetch } from "@/shared/api-client/http";
import type { IPeakHours } from "@/modules/analytics/types/analytics";

export const analyticsService = {
  getPeakHours(days?: number) {
    const query = days ? `?days=${days}` : "";
    return apiFetch<IPeakHours>(`/check-ins/peak-hours${query}`);
  },
};
