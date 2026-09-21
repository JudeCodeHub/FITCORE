import { apiFetch } from "@/shared/api-client/http";
import type { ICheckIn, ICheckInResult } from "@/modules/check-in/types/check-in";

export const checkInService = {
  checkIn(qrCodeId: string) {
    return apiFetch<ICheckInResult>("/check-ins", {
      method: "POST",
      body: JSON.stringify({ qrCodeId }),
    });
  },

  listRecent() {
    return apiFetch<ICheckIn[]>("/check-ins/recent");
  },
};
