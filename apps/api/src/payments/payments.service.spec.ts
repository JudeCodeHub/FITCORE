import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentsService } from './payments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('PaymentsService - Webhook verification', () => {
  let service: PaymentsService;
  let mockPrisma: any;

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_12345';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

    mockPrisma = {};
    service = new PaymentsService(mockPrisma as unknown as PrismaService);
  });

  it('throws BadRequestException if rawBody is missing', () => {
    expect(() => service.verifyWebhookSignature(undefined, 'sig_123')).toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequestException if signature is missing', () => {
    const rawBody = Buffer.from('{}');
    expect(() => service.verifyWebhookSignature(rawBody, undefined)).toThrow(
      BadRequestException,
    );
  });

  it('throws InternalServerErrorException if STRIPE_WEBHOOK_SECRET is not set', () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const rawBody = Buffer.from('{}');
    expect(() => service.verifyWebhookSignature(rawBody, 'sig_123')).toThrow(
      InternalServerErrorException,
    );
  });

  it('throws BadRequestException if signature verification fails', () => {
    const rawBody = Buffer.from('{}');
    expect(() => service.verifyWebhookSignature(rawBody, 'invalid_sig')).toThrow(
      BadRequestException,
    );
  });

  it('successfully returns received: true when webhook is handled', async () => {
    const mockEvent = { id: 'evt_test_1', type: 'payment_intent.succeeded' };
    vi.spyOn(service, 'verifyWebhookSignature').mockReturnValue(mockEvent as any);

    const result = await service.handleWebhook(Buffer.from('{}'), 'sig_123');
    expect(result).toEqual({ received: true });
  });
});
