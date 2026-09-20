import { IsDateString, IsString } from 'class-validator';

export class SelfBookPtSessionDto {
  @IsString()
  trainerId!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;
}
