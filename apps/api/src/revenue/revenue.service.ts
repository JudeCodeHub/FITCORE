import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type Duration = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

const MAX_TREND_MONTHS = 36;
const DEFAULT_TREND_MONTHS = 12;

function monthlyValue(price: number, duration: Duration): number {
  if (duration === 'MONTHLY') return price;
  if (duration === 'QUARTERLY') return price / 3;
  return price / 12;
}

function round2(amount: number): number {
  return Math.round(amount * 100) / 100;
}

@Injectable()
export class RevenueService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const active = await this.prisma.membership.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    const byPlan = new Map<
      string,
      { planId: string; planName: string; activeCount: number; mrr: number }
    >();
    let totalMrr = 0;

    for (const m of active) {
      const value = monthlyValue(Number(m.plan.price), m.plan.duration);
      totalMrr += value;
      const entry = byPlan.get(m.planId) ?? {
        planId: m.planId,
        planName: m.plan.name,
        activeCount: 0,
        mrr: 0,
      };
      entry.activeCount += 1;
      entry.mrr += value;
      byPlan.set(m.planId, entry);
    }

    return {
      totalMrr: round2(totalMrr),
      activeMembershipCount: active.length,
      byPlan: Array.from(byPlan.values())
        .map((p) => ({ ...p, mrr: round2(p.mrr) }))
        .sort((a, b) => b.mrr - a.mrr),
    };
  }

  /** There's no payment ledger yet (Stripe/Phase 3 is deferred), so MRR
   * is derived from subscription state — the same approach real MRR
   * dashboards use even with a payment processor, since MRR describes
   * recurring subscription run-rate, not literal cash received on a given
   * day. Historical months are reconstructed from `startDate`/`endDate`,
   * with one deliberate approximation: a currently-CANCELLED membership's
   * true stop date isn't stored (`Membership` has no `cancelledAt`), so
   * it's estimated as `min(endDate, updatedAt)` — cancelling necessarily
   * updates the row, and that update almost always happens before the
   * plan's natural end date. */
  async getMrrTrend(months?: number) {
    const clamped = Math.min(
      Math.max(months ?? DEFAULT_TREND_MONTHS, 1),
      MAX_TREND_MONTHS,
    );

    const memberships = await this.prisma.membership.findMany({
      where: { status: { not: 'PENDING' } },
      include: { plan: true },
    });

    const now = new Date();
    const trend: { month: string; mrr: number }[] = [];

    for (let i = clamped - 1; i >= 0; i--) {
      const monthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
      );
      const monthEnd = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1),
      );

      let mrr = 0;
      for (const m of memberships) {
        const effectiveEnd =
          m.status === 'CANCELLED'
            ? new Date(Math.min(m.endDate.getTime(), m.updatedAt.getTime()))
            : m.endDate;

        if (m.startDate < monthEnd && effectiveEnd >= monthStart) {
          mrr += monthlyValue(Number(m.plan.price), m.plan.duration);
        }
      }

      trend.push({
        month: monthStart.toISOString().slice(0, 7),
        mrr: round2(mrr),
      });
    }

    return trend;
  }
}
