import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentMethod, PaymentStatus, PlanDuration } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto.js';

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

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(private readonly prisma: PrismaService) {
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
}
