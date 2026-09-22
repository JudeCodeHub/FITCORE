import { apiFetch } from "@/shared/api-client/http";
import type {
  ICreateNotificationInput,
  INotification,
} from "@/modules/notifications/types/notification";

export const notificationsService = {
  listMine() {
    return apiFetch<INotification[]>("/notifications/me");
  },

  unreadCount() {
    return apiFetch<{ count: number }>("/notifications/me/unread-count");
  },

  markRead(id: string) {
    return apiFetch<INotification>(`/notifications/me/${id}/read`, {
      method: "PATCH",
    });
  },

  markAllRead() {
    return apiFetch<{ message: string }>("/notifications/me/read-all", {
      method: "POST",
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/notifications/me/${id}`, { method: "DELETE" });
  },

  create(input: ICreateNotificationInput) {
    return apiFetch<INotification>("/notifications", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
