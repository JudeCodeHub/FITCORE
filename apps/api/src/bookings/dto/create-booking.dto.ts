import { IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  classId!: string;

  @IsString()
  userId!: string;
}
