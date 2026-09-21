import { apiFetch } from "@/shared/api-client/http";
import type {
  IAvailabilityInput,
  IAvailabilityWindow,
} from "@/modules/trainer-availability/types/trainer-availability";

export const trainerAvailabilityService = {
  listMine() {
    return apiFetch<IAvailabilityWindow[]>("/trainer-availability/me");
  },

  create(input: IAvailabilityInput) {
    return apiFetch<IAvailabilityWindow>("/trainer-availability/me", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/trainer-availability/${id}`, {
      method: "DELETE",
    });
  },
};
