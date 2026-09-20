import { IsDateString, IsString } from 'class-validator';

export class CreatePtSessionDto {
  @IsString()
  trainerId!: string;

  @IsString()
  memberId!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;
}
