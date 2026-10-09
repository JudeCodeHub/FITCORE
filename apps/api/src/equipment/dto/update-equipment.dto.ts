import {
  IsDateString,
  IsIn,
  IsInt,
  Max,
  Min,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EQUIPMENT_STATUSES } from './create-equipment.dto.js';

export class UpdateEquipmentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  category?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsIn(EQUIPMENT_STATUSES)
  status?: (typeof EQUIPMENT_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  maintenanceIntervalDays?: number;

  @IsOptional()
  @IsDateString()
  nextMaintenanceAt?: string;
}
