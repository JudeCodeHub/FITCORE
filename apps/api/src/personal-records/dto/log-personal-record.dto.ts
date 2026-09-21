import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class LogPersonalRecordDto {
  @IsString()
  exerciseId!: string;

  @IsNumber()
  @Min(0.1)
  @Max(1000)
  weightKg!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  reps!: number;

  @IsOptional()
  @IsDateString()
  achievedAt?: string;
}
