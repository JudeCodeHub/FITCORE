import { apiFetch } from "@/shared/api-client/http";
import type {
  IPeakHours,
  ITrainerUtilization,
} from "@/modules/analytics/types/analytics";

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
};
