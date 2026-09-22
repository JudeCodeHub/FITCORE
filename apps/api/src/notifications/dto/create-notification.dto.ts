import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export const NOTIFICATION_TYPES = [
  'BOOKING_CONFIRMATION',
  'CLASS_REMINDER',
  'MEMBERSHIP_RENEWAL',
  'PAYMENT_ALERT',
  'PT_SESSION_CONFIRMATION',
  'MAINTENANCE_UPDATE',
  'GENERAL',
] as const;

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsIn(NOTIFICATION_TYPES)
  type!: (typeof NOTIFICATION_TYPES)[number];

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  message!: string;
}
