import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  successUrl?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  cancelUrl?: string;
}
