import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { overdueBalancesByUser } from '../payments/overdue-balance.js';
import { ReviewsService } from '../reviews/reviews.service.js';
import type { UpsertTrainerProfileDto } from './dto/upsert-trainer-profile.dto.js';

const DEFAULT_UTILIZATION_WINDOW_DAYS = 30;

function countWeekdayOccurrences(since: Date, until: Date): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const cursor = new Date(
    Date.UTC(since.getUTCFullYear(), since.getUTCMonth(), since.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(until.getUTCFullYear(), until.getUTCMonth(), until.getUTCDate()),
  );
  while (cursor <= end) {
    counts[cursor.getUTCDay()]++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return counts;
}

function sumMinutes(items: { startTime: Date; endTime: Date }[]): number {
  return items.reduce(
    (sum, item) =>
      sum + (item.endTime.getTime() - item.startTime.getTime()) / 60000,
    0,
  );
}

@Injectable()
export class TrainerProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reviews: ReviewsService,
  ) {}

  upsertMine(userId: string, dto: UpsertTrainerProfileDto) {
    return this.prisma.trainerProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: dto.bio,
        specialties: dto.specialties ?? [],
        certifications: dto.certifications ?? [],
        photoUrl: dto.photoUrl,
      },
      update: {
        bio: dto.bio,
        specialties: dto.specialties ?? [],
        certifications: dto.certifications ?? [],
        photoUrl: dto.photoUrl,
      },
    });
  }

  findMine(userId: string) {
    return this.prisma.trainerProfile.findUnique({ where: { userId } });
  }

  async findAll() {
    const trainers = await this.prisma.user.findMany({
      where: { role: 'TRAINER' },
      select: { id: true, name: true, trainerProfile: true },
      orderBy: { name: 'asc' },
    });

    const ratings = await this.reviews.getTrainerRatings(
      trainers.map((t) => t.id),
    );

    return trainers.map((t) => ({
      ...t,
      rating: ratings.get(t.id) ?? { average: null, count: 0 },
    }));
  }

  async findByTrainer(trainerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: trainerId },
      select: { id: true, name: true, role: true },
    });
    if (!user || user.role !== 'TRAINER') {
      throw new NotFoundException('Trainer not found');
    }

    const profile = await this.prisma.trainerProfile.findUnique({
      where: { userId: trainerId },
    });
    const rating = await this.reviews.getTrainerRating(trainerId);

    return { user: { id: user.id, name: user.name }, profile, rating };
  }

  listMyMembers(trainerId: string) {
    return this.prisma.user.findMany({
      where: { assignedTrainerId: trainerId },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: 'asc' },
    });
  }

  async listAllMembers() {
    const members = await this.prisma.user.findMany({
      where: { role: 'MEMBER' },
      select: {
        id: true,
        name: true,
        email: true,
        assignedTrainer: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
    if (members.length === 0) return [];
    const payments = await this.prisma.payment.findMany({
      where: {
        userId: { in: members.map((member) => member.id) },
        stripeInvoiceId: { not: null },
        status: { in: ['FAILED', 'SUCCEEDED'] },
      },
      select: { userId: true, stripeInvoiceId: true, status: true, amount: true, currency: true },
    });
    const balances = overdueBalancesByUser(payments);
    return members.map((member) => ({
      ...member,
      overdueBalances: balances.get(member.id) ?? [],
      hasOverdueBalance: (balances.get(member.id)?.length ?? 0) > 0,
    }));
  }

  async assignMember(trainerId: string, memberId: string) {
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
    });
    if (!trainer || trainer.role !== 'TRAINER') {
      throw new NotFoundException('Trainer not found');
    }

    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
    });
    if (!member || member.role !== 'MEMBER') {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.user.update({
      where: { id: memberId },
      data: { assignedTrainerId: trainerId },
      select: {
        id: true,
        name: true,
        email: true,
        assignedTrainer: { select: { id: true, name: true } },
      },
    });
  }

  async unassignMember(trainerId: string, memberId: string) {
    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
    });
    if (!member || member.assignedTrainerId !== trainerId) {
      throw new NotFoundException('Assignment not found');
    }

    await this.prisma.user.update({
      where: { id: memberId },
      data: { assignedTrainerId: null },
    });
  }

  async getUtilization(trainerId: string, days?: number) {
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
      select: { role: true },
    });
    if (!trainer || trainer.role !== 'TRAINER') {
      throw new NotFoundException('Trainer not found');
    }

    const windowDays = Math.min(
      Math.max(days ?? DEFAULT_UTILIZATION_WINDOW_DAYS, 1),
      365,
    );
    const until = new Date();
    const since = new Date(until.getTime() - windowDays * 24 * 60 * 60 * 1000);

    const [availability, ptSessions, classes] = await Promise.all([
      this.prisma.trainerAvailability.findMany({ where: { trainerId } }),
      this.prisma.pTSession.findMany({
        where: {
          trainerId,
          status: 'BOOKED',
          startTime: { gte: since, lte: until },
        },
        select: { startTime: true, endTime: true },
      }),
      this.prisma.class.findMany({
        where: { trainerId, startTime: { gte: since, lte: until } },
        select: { startTime: true, endTime: true },
      }),
    ]);

    const minutesPerWeekday = [0, 0, 0, 0, 0, 0, 0];
    for (const window of availability) {
      minutesPerWeekday[window.dayOfWeek] +=
        window.endMinute - window.startMinute;
    }

    const weekdayOccurrences = countWeekdayOccurrences(since, until);
    const availableMinutes = weekdayOccurrences.reduce(
      (sum, count, day) => sum + count * minutesPerWeekday[day],
      0,
    );

    const bookedMinutes = sumMinutes(ptSessions) + sumMinutes(classes);

    return {
      windowDays,
      since: since.toISOString(),
      until: until.toISOString(),
      sessionsRun: {
        ptSessions: ptSessions.length,
        classes: classes.length,
        total: ptSessions.length + classes.length,
      },
      hours: {
        booked: Math.round((bookedMinutes / 60) * 10) / 10,
        available: Math.round((availableMinutes / 60) * 10) / 10,
        utilizationPercent:
          availableMinutes > 0
            ? Math.round((bookedMinutes / availableMinutes) * 1000) / 10
            : null,
      },
    };
  }
}
