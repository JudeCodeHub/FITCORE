import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RefundPaymentDto {
  /**
   * Optional refund amount in dollars.
   * If omitted, a full refund of the remaining balance is issued.
   */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  /**
   * Optional administrative reason for the refund.
   */
  @IsOptional()
  @IsString()
  reason?: string;
}
