import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto.js';
import {
  type CheckoutSessionResult,
  type CreateCheckoutSessionResult,
  PaymentsService,
} from './payments.service.js';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout-session')
  createCheckoutSession(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<CreateCheckoutSessionResult> {
    return this.paymentsService.createCheckoutSession(user.sub, dto);
  }

  @Get('checkout-session/:sessionId')
  getCheckoutSession(
    @CurrentUser() user: RequestUser,
    @Param('sessionId') sessionId: string,
  ): Promise<CheckoutSessionResult> {
    return this.paymentsService.getCheckoutSession(user.sub, sessionId);
  }
}
