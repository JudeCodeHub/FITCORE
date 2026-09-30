import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentsService } from './payments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('PaymentsService - Webhook verification & idempotency', () => {
  let service: PaymentsService;
  let mockPrisma: any;

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_12345';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

    mockPrisma = {
      processedWebhookEvent: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
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

  it('processes new event and saves eventId for idempotency', async () => {
    const mockEvent = { id: 'evt_test_1', type: 'payment_intent.succeeded' };
    vi.spyOn(service, 'verifyWebhookSignature').mockReturnValue(mockEvent as any);
    mockPrisma.processedWebhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.processedWebhookEvent.create.mockResolvedValue({ id: 'rec_1', eventId: 'evt_test_1' });

    const result = await service.handleWebhook(Buffer.from('{}'), 'sig_123');

    expect(mockPrisma.processedWebhookEvent.findUnique).toHaveBeenCalledWith({
      where: { eventId: 'evt_test_1' },
    });
    expect(mockPrisma.processedWebhookEvent.create).toHaveBeenCalledWith({
      data: {
        eventId: 'evt_test_1',
        eventType: 'payment_intent.succeeded',
      },
    });
    expect(result).toEqual({ received: true, duplicate: false });
  });

  it('detects duplicate event and skips processing', async () => {
    const mockEvent = { id: 'evt_test_duplicate', type: 'payment_intent.succeeded' };
    vi.spyOn(service, 'verifyWebhookSignature').mockReturnValue(mockEvent as any);
    mockPrisma.processedWebhookEvent.findUnique.mockResolvedValue({
      id: 'rec_dup',
      eventId: 'evt_test_duplicate',
      eventType: 'payment_intent.succeeded',
    });

    const result = await service.handleWebhook(Buffer.from('{}'), 'sig_123');

    expect(mockPrisma.processedWebhookEvent.findUnique).toHaveBeenCalledWith({
      where: { eventId: 'evt_test_duplicate' },
    });
    expect(mockPrisma.processedWebhookEvent.create).not.toHaveBeenCalled();
    expect(result).toEqual({ received: true, duplicate: true });
  });

  it('handles concurrent race condition duplicate via unique constraint error', async () => {
    const mockEvent = { id: 'evt_test_race', type: 'payment_intent.succeeded' };
    vi.spyOn(service, 'verifyWebhookSignature').mockReturnValue(mockEvent as any);
    mockPrisma.processedWebhookEvent.findUnique.mockResolvedValue(null);
    const p2002Error: any = new Error('Unique constraint failed');
    p2002Error.code = 'P2002';
    mockPrisma.processedWebhookEvent.create.mockRejectedValue(p2002Error);

    const result = await service.handleWebhook(Buffer.from('{}'), 'sig_123');

    expect(result).toEqual({ received: true, duplicate: true });
  });
});
