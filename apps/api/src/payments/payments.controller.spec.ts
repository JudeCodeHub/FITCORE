import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it, vi } from 'vitest';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentsService = {
    createCheckoutSession: vi.fn(),
    getCheckoutSession: vi.fn(),
    handleWebhook: vi.fn(),
  };

  const mockJwtService = {
    verifyAsync: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PrismaService, useValue: { user: { findUnique: vi.fn() } } },
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should delegate to paymentsService.createCheckoutSession', async () => {
      const user = { sub: 'user-1', email: 'user@test.com', role: 'MEMBER' };
      const dto = { planId: 'plan-1' };
      const expectedResult = { sessionId: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' };

      mockPaymentsService.createCheckoutSession.mockResolvedValue(expectedResult);

      const result = await controller.createCheckoutSession(user, dto);

      expect(service.createCheckoutSession).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getCheckoutSession', () => {
    it('should delegate to paymentsService.getCheckoutSession', async () => {
      const user = { sub: 'user-1', email: 'user@test.com', role: 'MEMBER' };
      const expectedResult = {
        payment: { id: 'pay-1', amount: '49.00' },
        stripeStatus: 'complete',
        paymentStatus: 'paid',
        customerEmail: 'user@test.com',
      };

      mockPaymentsService.getCheckoutSession.mockResolvedValue(expectedResult);

      const result = await controller.getCheckoutSession(user, 'cs_test_123');

      expect(service.getCheckoutSession).toHaveBeenCalledWith('user-1', 'cs_test_123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('handleWebhook', () => {
    it('should delegate rawBody and signature to paymentsService.handleWebhook', async () => {
      const fakeBuffer = Buffer.from('{"id":"evt_123"}');
      const req = { rawBody: fakeBuffer } as RawBodyRequest<Request>;
      const sig = 't=123,v1=signature';

      mockPaymentsService.handleWebhook.mockResolvedValue({ received: true });

      const result = await controller.handleWebhook(req, sig);

      expect(service.handleWebhook).toHaveBeenCalledWith(fakeBuffer, sig);
      expect(result).toEqual({ received: true });
    });
  });

  describe('retryInvoicePayment', () => {
    it('should delegate to paymentsService.retryInvoicePayment', async () => {
      const user = { sub: 'user-1', email: 'user@test.com', role: 'MEMBER' };
      const expectedResult = {
        invoiceId: 'in_123',
        status: 'paid',
        paid: true,
        hostedInvoiceUrl: 'https://invoice.stripe.com/123',
      };

      mockPaymentsService.retryInvoicePayment = vi.fn().mockResolvedValue(expectedResult);

      const result = await controller.retryInvoicePayment(user, 'in_123');

      expect(mockPaymentsService.retryInvoicePayment).toHaveBeenCalledWith('user-1', 'in_123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('recordWalkInPayment', () => {
    it('should delegate to paymentsService.recordWalkInPayment', async () => {
      const user = { sub: 'staff-1', email: 'staff@test.com', role: 'FRONT_DESK' };
      const dto = { userId: 'u-1', amount: 50 };
      const expectedResult = { success: true, payment: { id: 'p-1' }, invoiceNumber: 'INV-1' };

      mockPaymentsService.recordWalkInPayment = vi.fn().mockResolvedValue(expectedResult);

      const result = await controller.recordWalkInPayment(user, dto as any);

      expect(mockPaymentsService.recordWalkInPayment).toHaveBeenCalledWith('staff-1', dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('searchMembers', () => {
    it('should delegate to paymentsService.searchMembers', async () => {
      mockPaymentsService.searchMembers = vi.fn().mockResolvedValue([{ id: 'u-1' }]);

      const result = await controller.searchMembers('John');

      expect(mockPaymentsService.searchMembers).toHaveBeenCalledWith('John');
      expect(result).toEqual([{ id: 'u-1' }]);
    });
  });

  describe('downloadInvoicePdf', () => {
    it('should delegate to paymentsService.generateInvoicePdf and return StreamableFile', async () => {
      const user = { sub: 'u-1', email: 'u1@test.com', role: 'MEMBER' };
      const fakeBuffer = Buffer.from('PDF_CONTENT');
      mockPaymentsService.generateInvoicePdf = vi.fn().mockResolvedValue({
        buffer: fakeBuffer,
        filename: 'INV-123.pdf',
      });

      const result = await controller.downloadInvoicePdf(user as any, 'pay-123');

      expect(mockPaymentsService.generateInvoicePdf).toHaveBeenCalledWith(
        'u-1',
        'pay-123',
        'MEMBER',
      );
      expect(result).toBeDefined();
    });
  });

  describe('getPayments & getPaymentHistory', () => {
    it('should delegate getPayments to paymentsService.getPaymentHistory', async () => {
      const user = { sub: 'u-1', email: 'u1@test.com', role: 'MEMBER' };
      const query = { status: 'SUCCEEDED' as any, page: 1, limit: 10 };
      const expectedResult = {
        data: [{ id: 'p-1' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        summary: { totalAmount: 49, succeededCount: 1, failedCount: 0, refundedCount: 0, pendingCount: 0 },
      };

      mockPaymentsService.getPaymentHistory = vi.fn().mockResolvedValue(expectedResult);

      const res1 = await controller.getPayments(user as any, query);
      expect(mockPaymentsService.getPaymentHistory).toHaveBeenCalledWith('u-1', 'MEMBER', query);
      expect(res1).toEqual(expectedResult);

      const res2 = await controller.getPaymentHistory(user as any, query);
      expect(res2).toEqual(expectedResult);
    });
  });

  describe('refundPayment', () => {
    it('should delegate to paymentsService.refundPayment', async () => {
      const dto = { amount: 25, reason: 'Customer requested' };
      const expectedResult = {
        success: true,
        payment: { id: 'p-1', status: 'SUCCEEDED', refundAmount: 25 },
        refundAmount: 25,
        totalRefunded: 25,
        isFullRefund: false,
      };

      mockPaymentsService.refundPayment = vi.fn().mockResolvedValue(expectedResult);

      const result = await controller.refundPayment('p-1', dto);

      expect(mockPaymentsService.refundPayment).toHaveBeenCalledWith('p-1', dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
