import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it, vi } from 'vitest';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentsService = {
    createCheckoutSession: vi.fn(),
    getCheckoutSession: vi.fn(),
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
});
