import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface Rating {
  average: number | null;
  count: number;
}

function aggregate(ratings: number[]): Rating {
  if (ratings.length === 0) return { average: null, count: 0 };
  return {
    average: round2(ratings.reduce((s, r) => s + r, 0) / ratings.length),
    count: ratings.length,
  };
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Members can only review a class they actually held a seat in (BOOKED,
   * not WAITLISTED/CANCELLED — the same "attended" approximation the
   * attendance analytics report uses, since there's no separate check-in
   * record tied to a class) or a PT session that was BOOKED, and only once
   * the class/session has actually concluded. */
  async create(userId: string, dto: CreateReviewDto) {
    const hasBooking = dto.bookingId != null;
    const hasSession = dto.ptSessionId != null;
    if (hasBooking === hasSession) {
      throw new BadRequestException(
        'Provide exactly one of bookingId or ptSessionId',
      );
    }

    const now = new Date();

    if (hasBooking) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: dto.bookingId },
        include: { class: { select: { endTime: true } } },
      });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.userId !== userId) {
        throw new ForbiddenException('You can only review your own bookings');
      }
      if (booking.status !== 'BOOKED') {
        throw new BadRequestException(
          'Only a booking you actually attended can be reviewed',
        );
      }
      if (booking.class.endTime > now) {
        throw new BadRequestException('This class has not concluded yet');
      }

      const existing = await this.prisma.review.findUnique({
        where: { bookingId: dto.bookingId },
      });
      if (existing) {
        throw new ConflictException('This booking has already been reviewed');
      }
    } else {
      const session = await this.prisma.pTSession.findUnique({
        where: { id: dto.ptSessionId },
      });
      if (!session) throw new NotFoundException('PT session not found');
      if (session.memberId !== userId) {
        throw new ForbiddenException(
          'You can only review your own PT sessions',
        );
      }
      if (session.status !== 'BOOKED') {
        throw new BadRequestException(
          'Only a session you actually attended can be reviewed',
        );
      }
      if (session.endTime > now) {
        throw new BadRequestException('This session has not concluded yet');
      }

      const existing = await this.prisma.review.findUnique({
        where: { ptSessionId: dto.ptSessionId },
      });
      if (existing) {
        throw new ConflictException('This session has already been reviewed');
      }
    }

    return this.prisma.review.create({
      data: {
        userId,
        bookingId: dto.bookingId,
        ptSessionId: dto.ptSessionId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  findMine(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        booking: { select: { class: { select: { name: true } } } },
        ptSession: { select: { trainer: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Concluded, actually-attended bookings/sessions the member hasn't
   * reviewed yet — drives a "rate your recent sessions" prompt. */
  async findEligible(userId: string) {
    const now = new Date();

    const [bookings, sessions] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          userId,
          status: 'BOOKED',
          review: null,
          class: { endTime: { lt: now } },
        },
        include: {
          class: {
            select: {
              name: true,
              endTime: true,
              trainer: { select: { name: true } },
            },
          },
        },
        orderBy: { class: { endTime: 'desc' } },
      }),
      this.prisma.pTSession.findMany({
        where: {
          memberId: userId,
          status: 'BOOKED',
          review: null,
          endTime: { lt: now },
        },
        include: { trainer: { select: { name: true } } },
        orderBy: { endTime: 'desc' },
      }),
    ]);

    return {
      classes: bookings.map((b) => ({
        bookingId: b.id,
        className: b.class.name,
        trainerName: b.class.trainer.name,
        endTime: b.class.endTime,
      })),
      ptSessions: sessions.map((s) => ({
        ptSessionId: s.id,
        trainerName: s.trainer.name,
        endTime: s.endTime,
      })),
    };
  }

  /** Ratings for each of the given class names, grouped by name since a
   * recurring class's individual sessions (sharing one `seriesId`) are the
   * same class type, not distinct classes to rate separately — matching
   * how the attendance analytics report already groups them. */
  async getClassRatings(names: string[]): Promise<Map<string, Rating>> {
    if (names.length === 0) return new Map();

    const reviews = await this.prisma.review.findMany({
      where: { booking: { class: { name: { in: names } } } },
      select: { rating: true, booking: { select: { class: { select: { name: true } } } } },
    });

    const byName = new Map<string, number[]>();
    for (const r of reviews) {
      const name = r.booking?.class.name;
      if (!name) continue;
      const list = byName.get(name) ?? [];
      list.push(r.rating);
      byName.set(name, list);
    }

    const result = new Map<string, Rating>();
    for (const name of names) {
      result.set(name, aggregate(byName.get(name) ?? []));
    }
    return result;
  }

  async getClassRating(name: string): Promise<Rating> {
    return (await this.getClassRatings([name])).get(name) ?? aggregate([]);
  }

  /** A trainer's overall rating combines reviews of classes they taught
   * (joined through booking->class->trainerId) and reviews of their own PT
   * sessions — both reflect on the same trainer, so there's one combined
   * average rather than two separate numbers. */
  async getTrainerRatings(trainerIds: string[]): Promise<Map<string, Rating>> {
    if (trainerIds.length === 0) return new Map();

    const [classReviews, ptReviews] = await Promise.all([
      this.prisma.review.findMany({
        where: { booking: { class: { trainerId: { in: trainerIds } } } },
        select: {
          rating: true,
          booking: { select: { class: { select: { trainerId: true } } } },
        },
      }),
      this.prisma.review.findMany({
        where: { ptSession: { trainerId: { in: trainerIds } } },
        select: { rating: true, ptSession: { select: { trainerId: true } } },
      }),
    ]);

    const byTrainer = new Map<string, number[]>();
    for (const r of classReviews) {
      const trainerId = r.booking?.class.trainerId;
      if (!trainerId) continue;
      const list = byTrainer.get(trainerId) ?? [];
      list.push(r.rating);
      byTrainer.set(trainerId, list);
    }
    for (const r of ptReviews) {
      const trainerId = r.ptSession?.trainerId;
      if (!trainerId) continue;
      const list = byTrainer.get(trainerId) ?? [];
      list.push(r.rating);
      byTrainer.set(trainerId, list);
    }

    const result = new Map<string, Rating>();
    for (const trainerId of trainerIds) {
      result.set(trainerId, aggregate(byTrainer.get(trainerId) ?? []));
    }
    return result;
  }

  async getTrainerRating(trainerId: string): Promise<Rating> {
    return (
      (await this.getTrainerRatings([trainerId])).get(trainerId) ??
      aggregate([])
    );
  }
}
