import { IsInt, IsString, Min } from 'class-validator';

export class WorkoutPlanExerciseInputDto {
  @IsString()
  exerciseId!: string;

  @IsInt()
  @Min(1)
  sets!: number;

  @IsInt()
  @Min(1)
  reps!: number;

  @IsInt()
  @Min(0)
  order!: number;
}
