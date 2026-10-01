import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import {
  MembershipStatus,
  PaymentMethod,
  PaymentStatus,
  PlanDuration,
} from '../generated/prisma/enums.js';
import { MailerService } from '../mailer/mailer.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto.js';
import { PaymentHistoryQueryDto } from './dto/payment-history-query.dto.js';
import { RecordWalkInPaymentDto } from './dto/record-walk-in-payment.dto.js';
import { RefundPaymentDto } from './dto/refund-payment.dto.js';
import { buildPaymentInvoicePdf } from './pdf-invoice.util.js';

export interface RefundPaymentResult {
  success: boolean;
  payment: any;
  refundAmount: number;
  totalRefunded: number;
  isFullRefund: boolean;
  stripeRefundId?: string | null;
}

export interface PaymentHistorySummary {
  totalAmount: number;
  succeededCount: number;
  failedCount: number;
  refundedCount: number;
  pendingCount: number;
}

export interface PaymentHistoryResult {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: PaymentHistorySummary;
}

export interface CreateCheckoutSessionResult {
  sessionId: string;
  url: string | null;
}

export interface CheckoutSessionResult {
  payment: any;
  stripeStatus?: string | null;
  paymentStatus?: string | null;
  customerEmail?: string | null;
}

export interface RetryInvoiceResult {
  invoiceId: string;
  status: string | null;
  paid: boolean;
  hostedInvoiceUrl?: string | null;
}

export interface WalkInPaymentResult {
  success: boolean;
  payment: any;
  invoiceNumber: string;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly notifications: NotificationsService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey);
    }
  }

  private getStripeClient(): Stripe {
    if (!this.stripe) {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        throw new InternalServerErrorException(
          'Stripe is not configured. Please set STRIPE_SECRET_KEY in the environment.',
        );
      }
      this.stripe = new Stripe(stripeKey);
    }
    return this.stripe;
  }

  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<CreateCheckoutSessionResult> {
    const stripe = this.getStripeClient();

    // 1. Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Verify plan exists and is active
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });
    if (!plan || !plan.isActive) {
      throw new BadRequestException('Selected plan is not available or inactive');
    }

    // 3. Ensure user has a Stripe Customer ID
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // 4. Calculate unit amount in cents and recurring intervals
    const unitAmountCents = Math.round(Number(plan.price) * 100);
    const recurringInterval: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Recurring =
      plan.duration === PlanDuration.ANNUAL
        ? { interval: 'year', interval_count: 1 }
        : plan.duration === PlanDuration.QUARTERLY
          ? { interval: 'month', interval_count: 3 }
          : { interval: 'month', interval_count: 1 };

    const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000';
    const successUrl =
      dto.successUrl ||
      `${webOrigin}/member?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = dto.cancelUrl || `${webOrigin}/member?checkout=cancelled`;

    // 5. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `FitCore ${plan.name}`,
              description: `FitCore ${plan.name} Gym Membership (${plan.duration})`,
            },
            unit_amount: unitAmountCents,
            recurring: recurringInterval,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // 6. Record pending payment intent / session in the database
    await this.prisma.payment.create({
      data: {
        userId: user.id,
        amount: plan.price,
        currency: 'usd',
        status: PaymentStatus.PENDING,
        method: PaymentMethod.STRIPE,
        stripeCheckoutSessionId: session.id,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async getCheckoutSession(
    userId: string,
    sessionId: string,
  ): Promise<CheckoutSessionResult> {
    const stripe = this.getStripeClient();

    const payment = await this.prisma.payment.findFirst({
      where: {
        stripeCheckoutSessionId: sessionId,
        userId,
      },
      include: {
        membership: {
          include: { plan: true },
        },
      },
    });

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        payment,
        stripeStatus: session.status,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
      };
    } catch {
      return { payment };
    }
  }

  verifyWebhookSignature(
    rawBody: Buffer | string | undefined,
    signature: string | undefined,
  ): Stripe.Event {
    if (!rawBody) {
      throw new BadRequestException('Raw request body is required for Stripe signature verification');
    }
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new InternalServerErrorException(
        'STRIPE_WEBHOOK_SECRET is not configured in the environment',
      );
    }

    const stripe = this.getStripeClient();
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Stripe webhook signature verification failed: ${err.message}`);
    }
  }

  async handleWebhook(
    rawBody: Buffer | string | undefined,
    signature: string | undefined,
  ): Promise<{ received: boolean; duplicate?: boolean }> {
    const event = this.verifyWebhookSignature(rawBody, signature);

    // Webhook idempotency: check if event has already been processed
    const existing = await this.prisma.processedWebhookEvent.findUnique({
      where: { eventId: event.id },
    });
    if (existing) {
      return { received: true, duplicate: true };
    }

    try {
      await this.prisma.processedWebhookEvent.create({
        data: {
          eventId: event.id,
          eventType: event.type,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return { received: true, duplicate: true };
      }
      throw err;
    }

    // Process recurring billing lifecycle events
    await this.processWebhookEvent(event);

    return { received: true, duplicate: false };
  }

  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        break;
    }
  }

  private calculateEndDate(startDate: Date, duration?: PlanDuration): Date {
    const end = new Date(startDate);
    if (duration === PlanDuration.ANNUAL) {
      end.setFullYear(end.getFullYear() + 1);
    } else if (duration === PlanDuration.QUARTERLY) {
      end.setMonth(end.getMonth() + 3);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  }

  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId || (session.client_reference_id as string);
    const planId = session.metadata?.planId;

    if (!userId || !planId) return;

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return;

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    const now = new Date();
    const endDate = this.calculateEndDate(now, plan.duration);

    let membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        status: { in: [MembershipStatus.PENDING, MembershipStatus.ACTIVE] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (membership) {
      membership = await this.prisma.membership.update({
        where: { id: membership.id },
        data: {
          status: MembershipStatus.ACTIVE,
          planId: plan.id,
          stripeSubscriptionId: subscriptionId ?? membership.stripeSubscriptionId,
          startDate: now,
          endDate,
        },
      });
    } else {
      membership = await this.prisma.membership.create({
        data: {
          userId,
          planId: plan.id,
          status: MembershipStatus.ACTIVE,
          stripeSubscriptionId: subscriptionId,
          startDate: now,
          endDate,
        },
      });
    }

    const payment = await this.prisma.payment.findFirst({
      where: { stripeCheckoutSessionId: session.id },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          membershipId: membership.id,
          stripePaymentIntentId: paymentIntentId ?? payment.stripePaymentIntentId,
          stripeSubscriptionId: subscriptionId ?? payment.stripeSubscriptionId,
        },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          userId,
          membershipId: membership.id,
          amount: plan.price,
          currency: session.currency || 'usd',
          status: PaymentStatus.SUCCEEDED,
          method: PaymentMethod.STRIPE,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          stripeSubscriptionId: subscriptionId,
        },
      });
    }
  }

  async handleInvoicePaid(invoice: Stripe.Invoice) {
    const rawInvoice = invoice as any;
    const subscriptionId =
      (typeof rawInvoice.subscription === 'string'
        ? rawInvoice.subscription
        : rawInvoice.subscription?.id) ||
      (typeof rawInvoice.parent?.subscription_details?.subscription === 'string'
        ? rawInvoice.parent.subscription_details.subscription
        : rawInvoice.parent?.subscription_details?.subscription?.id);

    if (!subscriptionId) return;

    let membership = await this.prisma.membership.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      include: { plan: true },
    });

    if (!membership && invoice.customer) {
      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer.id;
      const user = await this.prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (user) {
        const candidate = await this.prisma.membership.findFirst({
          where: { userId: user.id },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        });
        if (candidate) {
          membership = await this.prisma.membership.update({
            where: { id: candidate.id },
            data: { stripeSubscriptionId: subscriptionId },
            include: { plan: true },
          });
        }
      }
    }

    if (!membership) return;

    let newEndDate = membership.endDate;
    const lineItemPeriodEnd = invoice.lines?.data?.[0]?.period?.end;
    if (lineItemPeriodEnd) {
      newEndDate = new Date(lineItemPeriodEnd * 1000);
    } else if (membership.plan) {
      const baseDate = membership.endDate > new Date() ? membership.endDate : new Date();
      newEndDate = this.calculateEndDate(baseDate, membership.plan.duration);
    }

    await this.prisma.membership.update({
      where: { id: membership.id },
      data: {
        status: MembershipStatus.ACTIVE,
        endDate: newEndDate,
      },
    });

    const paymentIntentId =
      typeof rawInvoice.payment_intent === 'string'
        ? rawInvoice.payment_intent
        : rawInvoice.payment_intent?.id;

    const amountPaidDecimal = ((invoice.amount_paid ?? 0) / 100).toFixed(2);

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { stripeInvoiceId: invoice.id },
          ...(paymentIntentId ? [{ stripePaymentIntentId: paymentIntentId }] : []),
        ],
      },
    });

    if (existingPayment) {
      await this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          stripeInvoiceId: invoice.id,
          receiptUrl: invoice.hosted_invoice_url ?? existingPayment.receiptUrl,
          membershipId: membership.id,
        },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          userId: membership.userId,
          membershipId: membership.id,
          amount: amountPaidDecimal,
          currency: invoice.currency || 'usd',
          status: PaymentStatus.SUCCEEDED,
          method: PaymentMethod.STRIPE,
          stripeInvoiceId: invoice.id,
          stripePaymentIntentId: paymentIntentId,
          stripeSubscriptionId: subscriptionId,
          receiptUrl: invoice.hosted_invoice_url,
        },
      });
    }
  }

  async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const rawInvoice = invoice as any;
    const subscriptionId =
      (typeof rawInvoice.subscription === 'string'
        ? rawInvoice.subscription
        : rawInvoice.subscription?.id) ||
      (typeof rawInvoice.parent?.subscription_details?.subscription === 'string'
        ? rawInvoice.parent.subscription_details.subscription
        : rawInvoice.parent?.subscription_details?.subscription?.id);

    let membership: any = null;
    if (subscriptionId) {
      membership = await this.prisma.membership.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
        include: { plan: true, user: true },
      });
    }

    let user = membership?.user;
    let userId = user?.id;
    if (!userId && invoice.customer) {
      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer.id;
      user = await this.prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      userId = user?.id;
    }

    if (!userId) return;

    const paymentIntentId =
      typeof rawInvoice.payment_intent === 'string'
        ? rawInvoice.payment_intent
        : rawInvoice.payment_intent?.id;

    const amountDueDecimal = (
      ((invoice.amount_due ?? invoice.amount_remaining) || 0) / 100
    ).toFixed(2);
    const failureReason =
      (invoice as any).last_finalization_error?.message ||
      'Recurring invoice payment failed';

    const attemptCount = rawInvoice.attempt_count ?? 1;
    const nextPaymentAttempt = rawInvoice.next_payment_attempt;
    const nextRetryDate = nextPaymentAttempt
      ? new Date(nextPaymentAttempt * 1000)
      : null;
    const invoiceUrl = rawInvoice.hosted_invoice_url;

    // 1. Record failed payment entry
    await this.prisma.payment.create({
      data: {
        userId,
        membershipId: membership?.id,
        amount: amountDueDecimal,
        currency: invoice.currency || 'usd',
        status: PaymentStatus.FAILED,
        method: PaymentMethod.STRIPE,
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: paymentIntentId,
        stripeSubscriptionId: subscriptionId,
        failureReason,
      },
    });

    const userEmail = user?.email || invoice.customer_email;

    // 2. Dunning logic: Check if retries remain or if retries are exhausted
    if (nextRetryDate) {
      if (userEmail) {
        this.mailer.sendPaymentFailedDunningEmail(
          userEmail,
          amountDueDecimal,
          attemptCount,
          nextRetryDate,
          invoiceUrl,
        );
      }

      await this.notifications.create({
        userId,
        type: 'PAYMENT_ALERT',
        title: 'Payment Failed - Action Required',
        message: `Your payment of $${amountDueDecimal} failed (Attempt #${attemptCount}). Next retry scheduled for ${nextRetryDate.toLocaleDateString()}. Please update your payment method.`,
      });
    } else {
      // Retries exhausted: expire membership and notify
      if (membership) {
        await this.prisma.membership.update({
          where: { id: membership.id },
          data: { status: MembershipStatus.EXPIRED },
        });
      }

      if (userEmail) {
        this.mailer.sendMembershipSuspendedEmail(
          userEmail,
          membership?.plan?.name,
        );
      }

      await this.notifications.create({
        userId,
        type: 'PAYMENT_ALERT',
        title: 'Membership Suspended - Payment Failed',
        message: `All payment retry attempts for $${amountDueDecimal} have failed. Your membership has been suspended. Please update your card to restore access.`,
      });
    }
  }

  async retryInvoicePayment(
    userId: string,
    invoiceId: string,
  ): Promise<RetryInvoiceResult> {
    const stripe = this.getStripeClient();

    const payment = await this.prisma.payment.findFirst({
      where: {
        stripeInvoiceId: invoiceId,
        userId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment invoice not found for user');
    }

    try {
      const invoice = await stripe.invoices.pay(invoiceId);
      if (invoice.status === 'paid') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCEEDED,
            failureReason: null,
          },
        });
      }
      return {
        invoiceId: invoice.id,
        status: invoice.status,
        paid: invoice.status === 'paid',
        hostedInvoiceUrl: invoice.hosted_invoice_url,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to retry payment: ${err.message}`);
    }
  }

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const membership = await this.prisma.membership.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!membership) return;

    const dataToUpdate: any = {};

    if (subscription.status === 'active') {
      if (
        membership.status !== MembershipStatus.ACTIVE &&
        membership.status !== MembershipStatus.FROZEN
      ) {
        dataToUpdate.status = MembershipStatus.ACTIVE;
      }
      if ((subscription as any).current_period_end) {
        dataToUpdate.endDate = new Date(
          (subscription as any).current_period_end * 1000,
        );
      }
    } else if (
      subscription.status === 'canceled' ||
      subscription.status === 'unpaid'
    ) {
      dataToUpdate.status = MembershipStatus.CANCELLED;
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await this.prisma.membership.update({
        where: { id: membership.id },
        data: dataToUpdate,
      });
    }
  }

  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const membership = await this.prisma.membership.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!membership) return;

    await this.prisma.membership.update({
      where: { id: membership.id },
      data: { status: MembershipStatus.CANCELLED },
    });
  }

  async recordWalkInPayment(
    recorderUserId: string,
    dto: RecordWalkInPaymentDto,
  ): Promise<WalkInPaymentResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('Member not found');
    }

    let membership: any = null;

    if (dto.planId) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: dto.planId },
      });
      if (!plan || !plan.isActive) {
        throw new BadRequestException('Plan is not found or inactive');
      }

      const now = new Date();
      const endDate = this.calculateEndDate(now, plan.duration);

      const existing = await this.prisma.membership.findFirst({
        where: {
          userId: user.id,
          status: {
            in: [
              MembershipStatus.PENDING,
              MembershipStatus.ACTIVE,
              MembershipStatus.EXPIRED,
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        membership = await this.prisma.membership.update({
          where: { id: existing.id },
          data: {
            planId: plan.id,
            status: MembershipStatus.ACTIVE,
            startDate: now,
            endDate,
          },
          include: { plan: true },
        });
      } else {
        membership = await this.prisma.membership.create({
          data: {
            userId: user.id,
            planId: plan.id,
            status: MembershipStatus.ACTIVE,
            startDate: now,
            endDate,
          },
          include: { plan: true },
        });
      }
    } else if (dto.membershipId) {
      membership = await this.prisma.membership.findUnique({
        where: { id: dto.membershipId },
        include: { plan: true },
      });
      if (!membership) {
        throw new NotFoundException('Membership not found');
      }
      membership = await this.prisma.membership.update({
        where: { id: membership.id },
        data: { status: MembershipStatus.ACTIVE },
        include: { plan: true },
      });
    }

    const invoiceNumber = `INV-CASH-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    const amountDecimal = Number(dto.amount).toFixed(2);
    const method = dto.method || PaymentMethod.CASH;

    const payment = await this.prisma.payment.create({
      data: {
        userId: user.id,
        membershipId: membership?.id,
        amount: amountDecimal,
        currency: 'usd',
        status: PaymentStatus.SUCCEEDED,
        method,
        invoiceNumber,
        failureReason: dto.notes ? `Walk-in note: ${dto.notes}` : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        membership: { include: { plan: true } },
      },
    });

    const methodName = method === PaymentMethod.CARD_PRESENT ? 'card' : 'cash';

    // 1. Notify member via in-app alert
    await this.notifications.create({
      userId: user.id,
      type: 'PAYMENT_ALERT',
      title: 'Payment Received (Walk-In)',
      message: `A walk-in payment of $${amountDecimal} was recorded at the front desk via ${methodName}. Invoice #${invoiceNumber}.`,
    });

    // 2. Send stub email receipt
    this.mailer.sendCashPaymentReceiptEmail(user.email, amountDecimal, invoiceNumber);

    return {
      success: true,
      payment,
      invoiceNumber,
    };
  }

  async searchMembers(query?: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'MEMBER',
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        memberships: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { plan: true },
        },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async generateInvoicePdf(
    userId: string,
    paymentId: string,
    userRole?: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [{ id: paymentId }, { invoiceNumber: paymentId }],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        membership: { include: { plan: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    // Role-based access check: members can only download their own invoices
    if (userRole !== 'ADMIN' && userRole !== 'FRONT_DESK' && payment.userId !== userId) {
      throw new ForbiddenException('Access denied to this invoice');
    }

    let invoiceNumber = payment.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = `INV-${payment.id.slice(-8).toUpperCase()}`;
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { invoiceNumber },
      });
      payment.invoiceNumber = invoiceNumber;
    }

    const buffer = await buildPaymentInvoicePdf(payment as any);
    return {
      buffer,
      filename: `${invoiceNumber}.pdf`,
    };
  }

  async getPaymentHistory(
    requestingUserId: string,
    userRole?: string,
    query: PaymentHistoryQueryDto = {},
  ): Promise<PaymentHistoryResult> {
    const where: any = {};

    // Role-based access: Members can only view their own payment history
    if (userRole !== 'ADMIN' && userRole !== 'FRONT_DESK') {
      where.userId = requestingUserId;
    } else if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.method) {
      where.method = query.method;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        if (query.endDate.length <= 10) {
          end.setUTCHours(23, 59, 59, 999);
        }
        where.createdAt.lte = end;
      }
    }

    if (query.search?.trim()) {
      const s = query.search.trim();
      const searchConditions: any[] = [
        { invoiceNumber: { contains: s, mode: 'insensitive' } },
      ];
      if (userRole === 'ADMIN' || userRole === 'FRONT_DESK') {
        searchConditions.push(
          { user: { name: { contains: s, mode: 'insensitive' } } },
          { user: { email: { contains: s, mode: 'insensitive' } } },
        );
      }
      where.OR = searchConditions;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [total, payments, allMatching] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          membership: {
            include: {
              plan: { select: { id: true, name: true, duration: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.findMany({
        where,
        select: {
          amount: true,
          status: true,
        },
      }),
    ]);

    let totalAmount = 0;
    let succeededCount = 0;
    let failedCount = 0;
    let refundedCount = 0;
    let pendingCount = 0;

    for (const p of allMatching) {
      if (p.status === PaymentStatus.SUCCEEDED) {
        succeededCount++;
        totalAmount += Number(p.amount);
      } else if (p.status === PaymentStatus.FAILED) {
        failedCount++;
      } else if (p.status === PaymentStatus.REFUNDED) {
        refundedCount++;
      } else if (p.status === PaymentStatus.PENDING) {
        pendingCount++;
      }
    }

    return {
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalAmount: Number(totalAmount.toFixed(2)),
        succeededCount,
        failedCount,
        refundedCount,
        pendingCount,
      },
    };
  }

  async handleChargeRefunded(charge: Stripe.Charge) {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;

    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          ...(paymentIntentId ? [{ stripePaymentIntentId: paymentIntentId }] : []),
          ...(charge.id ? [{ stripePaymentIntentId: charge.id }] : []),
        ],
      },
      include: {
        user: true,
        membership: true,
      },
    });

    if (!payment) {
      return;
    }

    const refundedAmount = Number((charge.amount_refunded / 100).toFixed(2));
    const totalAmount = Number(payment.amount);
    const isFullRefund = charge.refunded || refundedAmount >= totalAmount;
    const newStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.SUCCEEDED;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        refundAmount: refundedAmount,
        refundedAt: new Date(),
        status: newStatus,
      },
    });

    if (isFullRefund && payment.membershipId) {
      await this.prisma.membership.update({
        where: { id: payment.membershipId },
        data: { status: MembershipStatus.CANCELLED },
      });
    }

    const invNumber = payment.invoiceNumber || `INV-${payment.id.slice(-8).toUpperCase()}`;
    await this.notifications.create({
      userId: payment.userId,
      type: 'PAYMENT_ALERT',
      title: isFullRefund ? 'Payment Refunded' : 'Partial Refund Processed',
      message: `A ${isFullRefund ? 'full' : 'partial'} refund of $${refundedAmount.toFixed(2)} was processed for invoice #${invNumber}.`,
    });

    this.mailer.sendRefundConfirmationEmail(
      payment.user.email,
      refundedAmount.toFixed(2),
      invNumber,
      isFullRefund,
    );
  }

  async refundPayment(
    paymentId: string,
    dto: RefundPaymentDto = {},
  ): Promise<RefundPaymentResult> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        membership: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException(
        `Cannot refund a payment with status '${payment.status}'. Only succeeded payments can be refunded.`,
      );
    }

    const totalAmount = Number(payment.amount);
    const currentRefunded = Number(payment.refundAmount || 0);
    const remainingRefundable = Number((totalAmount - currentRefunded).toFixed(2));

    if (remainingRefundable <= 0) {
      throw new BadRequestException('This payment has already been fully refunded');
    }

    const requestedAmount =
      dto.amount != null
        ? Number(Number(dto.amount).toFixed(2))
        : remainingRefundable;

    if (requestedAmount <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero');
    }

    if (requestedAmount > remainingRefundable) {
      throw new BadRequestException(
        `Refund amount ($${requestedAmount}) exceeds the remaining refundable amount ($${remainingRefundable})`,
      );
    }

    let stripeRefundId: string | null = null;
    if (
      payment.method === PaymentMethod.STRIPE &&
      payment.stripePaymentIntentId &&
      this.stripe
    ) {
      try {
        const stripeRefund = await this.stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          amount: Math.round(requestedAmount * 100),
          reason: dto.reason ? 'requested_by_customer' : undefined,
        });
        stripeRefundId = stripeRefund.id;
      } catch (stripeErr: any) {
        throw new BadRequestException(`Stripe refund failed: ${stripeErr.message}`);
      }
    }

    const newRefundAmount = Number((currentRefunded + requestedAmount).toFixed(2));
    const isFullRefund = newRefundAmount >= totalAmount;
    const newStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.SUCCEEDED;

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        refundAmount: newRefundAmount,
        refundedAt: new Date(),
        status: newStatus,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        membership: { include: { plan: true } },
      },
    });

    // If fully refunded, cancel the associated membership access
    if (isFullRefund && payment.membershipId) {
      await this.prisma.membership.update({
        where: { id: payment.membershipId },
        data: { status: MembershipStatus.CANCELLED },
      });
    }

    const formattedRefund = requestedAmount.toFixed(2);
    const invNumber =
      payment.invoiceNumber || `INV-${payment.id.slice(-8).toUpperCase()}`;

    await this.notifications.create({
      userId: payment.userId,
      type: 'PAYMENT_ALERT',
      title: isFullRefund ? 'Payment Refunded' : 'Partial Refund Processed',
      message: `A ${isFullRefund ? 'full' : 'partial'} refund of $${formattedRefund} has been processed for invoice #${invNumber}.${dto.reason ? ` Reason: ${dto.reason}` : ''}`,
    });

    this.mailer.sendRefundConfirmationEmail(
      payment.user.email,
      formattedRefund,
      invNumber,
      isFullRefund,
      dto.reason,
    );

    return {
      success: true,
      payment: updatedPayment,
      refundAmount: requestedAmount,
      totalRefunded: newRefundAmount,
      isFullRefund,
      stripeRefundId,
    };
  }
}
