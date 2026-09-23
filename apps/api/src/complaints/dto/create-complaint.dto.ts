import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export const COMPLAINT_TYPES = ['COMPLAINT', 'SUGGESTION'] as const;

export class CreateComplaintDto {
  @IsIn(COMPLAINT_TYPES)
  type!: (typeof COMPLAINT_TYPES)[number];

  @IsString()
  @MinLength(3)
  @MaxLength(150)
  subject!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message!: string;
}
