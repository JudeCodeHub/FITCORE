import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRecurringClassDto {
  @IsString()
  @MinLength(2)
  name!: string;

  /** Required when an ADMIN creates the series; ignored (forced to self) for a TRAINER. */
  @IsOptional()
  @IsString()
  trainerId?: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  /** Start time of the FIRST occurrence — its date anchors the series, its
   * time-of-day applies to every generated occurrence. */
  @IsDateString()
  startTime!: string;

  /** End time of the FIRST occurrence — only used to compute the duration
   * applied to every generated occurrence. */
  @IsDateString()
  endTime!: string;

  /** Days of week to repeat on, 0=Sunday .. 6=Saturday. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek!: number[];

  /** Total number of sessions to generate across the matching weekdays. */
  @IsInt()
  @Min(1)
  @Max(52)
  occurrenceCount!: number;
}
