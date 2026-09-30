import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it, vi } from 'vitest';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';

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
});
