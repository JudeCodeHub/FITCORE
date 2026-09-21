import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { WorkoutPlanExerciseInputDto } from './workout-plan-exercise-input.dto.js';

export class CreateWorkoutPlanDto {
  @IsString()
  memberId!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanExerciseInputDto)
  exercises!: WorkoutPlanExerciseInputDto[];
}
