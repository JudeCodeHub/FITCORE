import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMaintenanceTicketDto {
  @IsString()
  equipmentId!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  description!: string;
}
