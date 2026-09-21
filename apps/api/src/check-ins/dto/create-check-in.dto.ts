import { IsString, MinLength } from 'class-validator';

export class CreateCheckInDto {
  @IsString()
  @MinLength(1)
  qrCodeId!: string;
}
