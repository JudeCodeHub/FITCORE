import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto.js';
import {
  type CheckoutSessionResult,
  type CreateCheckoutSessionResult,
  type RetryInvoiceResult,
  PaymentsService,
} from './payments.service.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout-session')
  @UseGuards(JwtAuthGuard)
  createCheckoutSession(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<CreateCheckoutSessionResult> {
    return this.paymentsService.createCheckoutSession(user.sub, dto);
  }

  @Get('checkout-session/:sessionId')
  @UseGuards(JwtAuthGuard)
  getCheckoutSession(
    @CurrentUser() user: RequestUser,
    @Param('sessionId') sessionId: string,
  ): Promise<CheckoutSessionResult> {
    return this.paymentsService.getCheckoutSession(user.sub, sessionId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ): Promise<{ received: boolean; duplicate?: boolean }> {
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }

  @Post('invoices/:invoiceId/retry')
  @UseGuards(JwtAuthGuard)
  retryInvoicePayment(
    @CurrentUser() user: RequestUser,
    @Param('invoiceId') invoiceId: string,
  ): Promise<RetryInvoiceResult> {
    return this.paymentsService.retryInvoicePayment(user.sub, invoiceId);
  }
}
