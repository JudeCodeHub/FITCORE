import { apiFetch } from "@/shared/api-client/http";
import type {
  ICreateWorkoutPlanInput,
  IUpdateWorkoutPlanInput,
  IWorkoutPlan,
} from "@/modules/workout-plans/types/workout-plan";

export const workoutPlansService = {
  listMine() {
    return apiFetch<IWorkoutPlan[]>("/workout-plans/me");
  },

  listForMember(memberId: string) {
    return apiFetch<IWorkoutPlan[]>(`/workout-plans/member/${memberId}`);
  },

  getOne(id: string) {
    return apiFetch<IWorkoutPlan>(`/workout-plans/${id}`);
  },

  create(input: ICreateWorkoutPlanInput) {
    return apiFetch<IWorkoutPlan>("/workout-plans", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: IUpdateWorkoutPlanInput) {
    return apiFetch<IWorkoutPlan>(`/workout-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/workout-plans/${id}`, { method: "DELETE" });
  },
};
