import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CreateBodyMetricDto {
  @IsNumber()
  @Min(1)
  @Max(500)
  weightKg!: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(272)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bodyFatPct?: number;

  @IsOptional()
  @IsObject()
  measurements?: Record<string, number>;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
