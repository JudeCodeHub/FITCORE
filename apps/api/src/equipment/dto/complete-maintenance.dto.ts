import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteMaintenanceDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
