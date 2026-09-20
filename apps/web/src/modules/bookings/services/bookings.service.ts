import { apiFetch } from "@/shared/api-client/http";
import type { IBookingResult, IMyBooking } from "@/modules/bookings/types/booking";

export const bookingsService = {
  bookClass(classId: string) {
    return apiFetch<IBookingResult>("/bookings/me", {
      method: "POST",
      body: JSON.stringify({ classId }),
    });
  },

  listMine() {
    return apiFetch<IMyBooking[]>("/bookings/me");
  },

  cancelMine(id: string) {
    return apiFetch<IBookingResult>(`/bookings/me/${id}/cancel`, {
      method: "POST",
    });
  },
};
