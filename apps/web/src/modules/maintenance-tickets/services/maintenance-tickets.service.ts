import { apiFetch } from "@/shared/api-client/http";
import type {
  ICreateMaintenanceTicketInput,
  IMaintenanceTicket,
  MaintenanceTicketStatus,
} from "@/modules/maintenance-tickets/types/maintenance-ticket";

export const maintenanceTicketsService = {
  list(status?: MaintenanceTicketStatus) {
    const query = status ? `?status=${status}` : "";
    return apiFetch<IMaintenanceTicket[]>(`/maintenance-tickets${query}`);
  },

  create(input: ICreateMaintenanceTicketInput) {
    return apiFetch<IMaintenanceTicket>("/maintenance-tickets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateStatus(id: string, status: MaintenanceTicketStatus) {
    return apiFetch<IMaintenanceTicket>(`/maintenance-tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/maintenance-tickets/${id}`, { method: "DELETE" });
  },
};
