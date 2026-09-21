import type { IExercise } from "@/modules/exercises";

export interface IWorkoutPlanExercise {
  id: string;
  planId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  order: number;
  exercise: IExercise;
}

export interface IWorkoutPlan {
  id: string;
  memberId: string;
  createdById: string;
  name: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: IWorkoutPlanExercise[];
}

export interface IWorkoutPlanExerciseInput {
  exerciseId: string;
  sets: number;
  reps: number;
  order: number;
}

export interface ICreateWorkoutPlanInput {
  memberId: string;
  name: string;
  notes?: string;
  exercises: IWorkoutPlanExerciseInput[];
}

export interface IUpdateWorkoutPlanInput {
  name?: string;
  notes?: string;
  exercises?: IWorkoutPlanExerciseInput[];
}
