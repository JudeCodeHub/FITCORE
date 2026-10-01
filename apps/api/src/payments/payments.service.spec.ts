import { BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentsService } from './payments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailerService } from '../mailer/mailer.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

describe('PaymentsService - Webhook verification, idempotency & retry logic', () => {
  let service: PaymentsService;
  let mockPrisma: any;
  let mockMailer: any;
  let mockNotifications: any;

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
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
    };

    mockMailer = {
      sendPaymentFailedDunningEmail: vi.fn(),
      sendMembershipSuspendedEmail: vi.fn(),
      sendCashPaymentReceiptEmail: vi.fn(),
    };

    mockNotifications = {
      create: vi.fn(),
    };

    service = new PaymentsService(
      mockPrisma as unknown as PrismaService,
      mockMailer as unknown as MailerService,
      mockNotifications as unknown as NotificationsService,
    );
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

  describe('Recurring billing lifecycle & dunning handlers', () => {
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

    it('handles invoice.payment_failed with next retry scheduled by sending dunning email and notification', async () => {
      const invoice = {
        id: 'in_fail_123',
        subscription: 'sub_123',
        amount_due: 4900,
        currency: 'usd',
        payment_intent: 'pi_fail',
        attempt_count: 1,
        next_payment_attempt: 1800000000,
        hosted_invoice_url: 'https://stripe.com/invoice/in_fail_123',
        last_finalization_error: { message: 'Card declined' },
      };
      mockPrisma.membership.findUnique.mockResolvedValue({
        id: 'mem-1',
        userId: 'user-1',
        user: { id: 'user-1', email: 'member@test.com' },
        plan: { name: 'Premium' },
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
      expect(mockMailer.sendPaymentFailedDunningEmail).toHaveBeenCalledWith(
        'member@test.com',
        '49.00',
        1,
        new Date(1800000000 * 1000),
        'https://stripe.com/invoice/in_fail_123',
      );
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'PAYMENT_ALERT',
        }),
      );
    });

    it('handles invoice.payment_failed when retries exhausted by setting membership EXPIRED and sending suspension email', async () => {
      const invoice = {
        id: 'in_fail_exhausted',
        subscription: 'sub_123',
        amount_due: 4900,
        currency: 'usd',
        payment_intent: 'pi_fail',
        attempt_count: 3,
        next_payment_attempt: null,
        last_finalization_error: { message: 'Insufficient funds' },
      };
      mockPrisma.membership.findUnique.mockResolvedValue({
        id: 'mem-1',
        userId: 'user-1',
        user: { id: 'user-1', email: 'member@test.com' },
        plan: { name: 'Pro' },
      });
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-fail' });

      await service.handleInvoicePaymentFailed(invoice as any);

      expect(mockPrisma.membership.update).toHaveBeenCalledWith({
        where: { id: 'mem-1' },
        data: { status: 'EXPIRED' },
      });
      expect(mockMailer.sendMembershipSuspendedEmail).toHaveBeenCalledWith(
        'member@test.com',
        'Pro',
      );
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'PAYMENT_ALERT',
          title: expect.stringContaining('Membership Suspended'),
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

    it('retryInvoicePayment throws NotFoundException when invoice payment not found', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue(null);

      await expect(
        service.retryInvoicePayment('user-1', 'in_unknown'),
      ).rejects.toThrow(NotFoundException);
    });

    it('recordWalkInPayment throws NotFoundException when member not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.recordWalkInPayment('staff-1', { userId: 'u-missing', amount: 50 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('recordWalkInPayment records cash payment, activates membership, and sends alerts', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1', name: 'John Doe', email: 'john@test.com' });
      mockPrisma.plan.findUnique.mockResolvedValue({ id: 'p-1', name: 'Gold', price: 99, duration: 'MONTHLY', isActive: true });
      mockPrisma.membership.findFirst.mockResolvedValue(null);
      mockPrisma.membership.create.mockResolvedValue({ id: 'mem-1' });
      mockPrisma.payment.create.mockResolvedValue({
        id: 'pay-1',
        amount: '99.00',
        method: 'CASH',
        invoiceNumber: 'INV-CASH-123',
      });

      const res = await service.recordWalkInPayment('staff-1', {
        userId: 'u-1',
        planId: 'p-1',
        amount: 99,
        method: 'CASH' as any,
        notes: 'Paid at front counter',
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.membership.create).toHaveBeenCalled();
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u-1',
            amount: '99.00',
            status: 'SUCCEEDED',
            method: 'CASH',
          }),
        }),
      );
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u-1',
          type: 'PAYMENT_ALERT',
        }),
      );
      expect(mockMailer.sendCashPaymentReceiptEmail).toHaveBeenCalledWith(
        'john@test.com',
        '99.00',
        expect.stringContaining('INV-CASH-'),
      );
    });

    it('searchMembers queries active members', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u-1', name: 'John Doe', email: 'john@test.com', memberships: [] },
      ]);

      const res = await service.searchMembers('John');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'MEMBER',
          }),
        }),
      );
      expect(res).toHaveLength(1);
    });
  });

  describe('generateInvoicePdf', () => {
    it('throws NotFoundException when payment record does not exist', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue(null);

      await expect(service.generateInvoicePdf('user-1', 'pay-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when a member tries to access another member invoice', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        userId: 'other-user',
        amount: 50,
      });

      await expect(
        service.generateInvoicePdf('user-1', 'pay-1', 'MEMBER'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('generates a PDF buffer and creates an invoiceNumber if missing', async () => {
      const mockPayment = {
        id: 'pay-12345678',
        userId: 'user-1',
        amount: 49.99,
        currency: 'usd',
        status: 'SUCCEEDED',
        method: 'STRIPE',
        createdAt: new Date('2026-03-01'),
        invoiceNumber: null,
        user: { id: 'user-1', name: 'Alex Gymmer', email: 'alex@example.com' },
        membership: {
          id: 'mem-1',
          startDate: new Date('2026-03-01'),
          endDate: new Date('2026-04-01'),
          plan: { name: 'Gold Unlimited', duration: 'MONTHLY' },
        },
      };

      mockPrisma.payment.findFirst.mockResolvedValue(mockPayment);
      mockPrisma.payment.update.mockResolvedValue({
        ...mockPayment,
        invoiceNumber: 'INV-12345678',
      });

      const result = await service.generateInvoicePdf('user-1', 'pay-12345678', 'MEMBER');

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay-12345678' },
        data: { invoiceNumber: 'INV-12345678' },
      });
      expect(result.filename).toBe('INV-12345678.pdf');
      expect(Buffer.isBuffer(result.buffer)).toBe(true);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    it('allows ADMIN or FRONT_DESK to generate PDF for any user', async () => {
      const mockPayment = {
        id: 'pay-abc',
        userId: 'member-99',
        amount: 99.0,
        currency: 'usd',
        status: 'SUCCEEDED',
        method: 'CASH',
        createdAt: new Date(),
        invoiceNumber: 'INV-EXISTING-123',
        user: { id: 'member-99', name: 'Sam Member', email: 'sam@example.com' },
        membership: null,
      };

      mockPrisma.payment.findFirst.mockResolvedValue(mockPayment);

      const result = await service.generateInvoicePdf('admin-1', 'pay-abc', 'ADMIN');

      expect(result.filename).toBe('INV-EXISTING-123.pdf');
      expect(Buffer.isBuffer(result.buffer)).toBe(true);
    });
  });
});
