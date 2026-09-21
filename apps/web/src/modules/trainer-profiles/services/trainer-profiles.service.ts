import { apiFetch } from "@/shared/api-client/http";
import type {
  IAssignedMember,
  IMemberWithTrainer,
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

  listMyMembers() {
    return apiFetch<IAssignedMember[]>("/trainer-profiles/me/members");
  },

  listAllMembers() {
    return apiFetch<IMemberWithTrainer[]>("/trainer-profiles/members");
  },

  assignMember(trainerId: string, memberId: string) {
    return apiFetch<IMemberWithTrainer>(
      `/trainer-profiles/${trainerId}/members/${memberId}`,
      { method: "PUT" },
    );
  },

  unassignMember(trainerId: string, memberId: string) {
    return apiFetch<void>(
      `/trainer-profiles/${trainerId}/members/${memberId}`,
      { method: "DELETE" },
    );
  },
};
