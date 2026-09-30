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
      plan: {
        findUnique: vi.fn(),
      },
      membership: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      payment: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findFirst: vi.fn(),
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

  describe('Recurring billing lifecycle handlers', () => {
    it('handles checkout.session.completed by creating or activating membership', async () => {
      const session = {
        id: 'cs_123',
        subscription: 'sub_123',
        payment_intent: 'pi_123',
        metadata: { userId: 'user-1', planId: 'plan-1' },
      };
      mockPrisma.plan.findUnique.mockResolvedValue({ id: 'plan-1', duration: 'MONTHLY', price: '49.00' });
      mockPrisma.membership.findFirst.mockResolvedValue(null);
      mockPrisma.membership.create.mockResolvedValue({ id: 'mem-1' });
      mockPrisma.payment.findFirst.mockResolvedValue({ id: 'pay-1' });
      mockPrisma.payment.update.mockResolvedValue({ id: 'pay-1' });

      await service.handleCheckoutSessionCompleted(session as any);

      expect(mockPrisma.membership.create).toHaveBeenCalled();
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({ status: 'SUCCEEDED', membershipId: 'mem-1' }),
        }),
      );
    });

    it('handles invoice.paid by extending membership and recording payment', async () => {
      const invoice = {
        id: 'in_123',
        subscription: 'sub_123',
        amount_paid: 4900,
        currency: 'usd',
        payment_intent: 'pi_123',
        hosted_invoice_url: 'https://stripe.com/invoice/in_123',
        lines: { data: [{ period: { end: 1800000000 } }] },
      };
      mockPrisma.membership.findUnique.mockResolvedValue({
        id: 'mem-1',
        userId: 'user-1',
        endDate: new Date(),
        plan: { duration: 'MONTHLY' },
      });
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-new' });

      await service.handleInvoicePaid(invoice as any);

      expect(mockPrisma.membership.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'mem-1' },
          data: expect.objectContaining({ status: 'ACTIVE', endDate: new Date(1800000000 * 1000) }),
        }),
      );
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'SUCCEEDED',
            amount: '49.00',
            stripeInvoiceId: 'in_123',
          }),
        }),
      );
    });

    it('handles invoice.payment_failed by creating FAILED payment record', async () => {
      const invoice = {
        id: 'in_fail_123',
        subscription: 'sub_123',
        amount_due: 4900,
        currency: 'usd',
        payment_intent: 'pi_fail',
        last_finalization_error: { message: 'Card declined' },
      };
      mockPrisma.membership.findUnique.mockResolvedValue({
        id: 'mem-1',
        userId: 'user-1',
      });
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-fail' });

      await service.handleInvoicePaymentFailed(invoice as any);

      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            failureReason: 'Card declined',
          }),
        }),
      );
    });

    it('handles customer.subscription.deleted by cancelling membership', async () => {
      const subscription = {
        id: 'sub_del_123',
      };
      mockPrisma.membership.findUnique.mockResolvedValue({ id: 'mem-1' });
      mockPrisma.membership.update.mockResolvedValue({ id: 'mem-1', status: 'CANCELLED' });

      await service.handleSubscriptionDeleted(subscription as any);

      expect(mockPrisma.membership.update).toHaveBeenCalledWith({
        where: { id: 'mem-1' },
        data: { status: 'CANCELLED' },
      });
    });
  });
});
