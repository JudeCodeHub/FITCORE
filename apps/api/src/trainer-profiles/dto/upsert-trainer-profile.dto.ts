import { IsArray, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpsertTrainerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  specialties?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  certifications?: string[];

  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
