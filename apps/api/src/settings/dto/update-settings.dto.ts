import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { HoursDto } from './hours.dto.js';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => HoursDto)
  hours?: HoursDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  branches?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  freezeDaysPerYearLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  cancellationNoticeDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  renewalGraceDays?: number;
}
