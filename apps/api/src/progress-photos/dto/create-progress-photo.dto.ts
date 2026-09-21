import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProgressPhotoDto {
  @IsString()
  key!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsDateString()
  takenAt?: string;
}
