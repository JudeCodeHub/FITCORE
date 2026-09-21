import { apiFetch } from "@/shared/api-client/http";
import type {
  IBodyMetric,
  IBodyMetricInput,
} from "@/modules/body-metrics/types/body-metric";

export const bodyMetricsService = {
  listMine() {
    return apiFetch<IBodyMetric[]>("/body-metrics/me");
  },

  create(input: IBodyMetricInput) {
    return apiFetch<IBodyMetric>("/body-metrics/me", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/body-metrics/${id}`, { method: "DELETE" });
  },
};
