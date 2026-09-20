import { apiFetch } from "@/shared/api-client/http";
import type { IPtSession } from "@/modules/pt-sessions/types/pt-session";

export const ptSessionsService = {
  listMine() {
    return apiFetch<IPtSession[]>("/pt-sessions/me");
  },

  cancelMine(id: string) {
    return apiFetch<IPtSession>(`/pt-sessions/me/${id}/cancel`, {
      method: "POST",
    });
  },
};
