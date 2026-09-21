import { apiFetch } from "@/shared/api-client/http";
import type { IExercise } from "@/modules/exercises/types/exercise";

export const exercisesService = {
  listAll() {
    return apiFetch<IExercise[]>("/exercises");
  },
};
