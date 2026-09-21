import { apiFetch } from "@/shared/api-client/http";
import type {
  ITrainerProfile,
  ITrainerProfileInput,
  ITrainerPublicProfile,
  ITrainerSummary,
} from "@/modules/trainer-profiles/types/trainer-profile";

export const trainerProfilesService = {
  getMine() {
    return apiFetch<ITrainerProfile | null>("/trainer-profiles/me");
  },

  upsertMine(input: ITrainerProfileInput) {
    return apiFetch<ITrainerProfile>("/trainer-profiles/me", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  listAll() {
    return apiFetch<ITrainerSummary[]>("/trainer-profiles");
  },

  getByTrainerId(trainerId: string) {
    return apiFetch<ITrainerPublicProfile>(`/trainer-profiles/${trainerId}`);
  },
};
