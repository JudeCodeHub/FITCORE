import type { IExercise } from "@/modules/exercises";

export interface IPersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exercise: IExercise;
  weightKg: number;
  reps: number;
  achievedAt: string;
  createdAt: string;
  estimated1RM: number;
}

export interface IPersonalRecordInput {
  exerciseId: string;
  weightKg: number;
  reps: number;
  achievedAt?: string;
}
