import { IsString } from 'class-validator';

export class SelfBookClassDto {
  @IsString()
  classId!: string;
}
