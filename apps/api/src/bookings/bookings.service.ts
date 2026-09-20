import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';
const CANCELLATION_CUTOFF_HOURS = 2;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto) {
    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ capacity: number }[]>`
        SELECT capacity FROM "Class" WHERE id = ${dto.classId} FOR UPDATE
      `;
      if (locked.length === 0) throw new NotFoundException('Class not found');
      const capacity = locked[0].capacity;

      const user = await tx.user.findUnique({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('User not found');

      const existing = await tx.booking.findFirst({
        where: {
          classId: dto.classId,
          userId: dto.userId,
          status: { in: ['BOOKED', 'WAITLISTED'] },
        },
      });
      if (existing) {
        throw new ConflictException(
          `This user is already ${existing.status.toLowerCase()} for this class`,
        );
      }

      const bookedCount = await tx.booking.count({
        where: { classId: dto.classId, status: 'BOOKED' },
      });

      const booking = await tx.booking.create({
        data: {
          classId: dto.classId,
          userId: dto.userId,
          status: bookedCount < capacity ? 'BOOKED' : 'WAITLISTED',
        },
      });

      if (booking.status === 'WAITLISTED') {
        const aheadCount = await tx.booking.count({
          where: {
            classId: dto.classId,
            status: 'WAITLISTED',
            bookedAt: { lt: booking.bookedAt },
          },
        });
        return { ...booking, waitlistPosition: aheadCount + 1 };
      }

      return booking;
    });
  }

  async findByClass(classId: string) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');

    const bookings = await this.prisma.booking.findMany({
      where: { classId, status: { in: ['BOOKED', 'WAITLISTED'] } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { bookedAt: 'asc' },
    });

    const booked = bookings.filter((b) => b.status === 'BOOKED');
    const waitlisted = bookings.filter((b) => b.status === 'WAITLISTED');

    return {
      capacity: cls.capacity,
      bookedCount: booked.length,
      booked,
      waitlisted: waitlisted.map((b, i) => ({ ...b, waitlistPosition: i + 1 })),
    };
  }
  async cancel(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  async findMine(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId, status: { in: ['BOOKED', 'WAITLISTED'] } },
      include: {
        class: { include: { trainer: { select: { id: true, name: true } } } },
      },
      orderBy: { class: { startTime: 'asc' } },
    });

    const now = new Date();

    return Promise.all(
      bookings.map(async (b) => {
        if (b.status === 'WAITLISTED') {
          // Position among ALL waitlisters for that class, not just this
          // user's own bookings — a user only ever has one booking per
          // class, so a per-user counter here would always read 1.
          const aheadCount = await this.prisma.booking.count({
            where: {
              classId: b.classId,
              status: 'WAITLISTED',
              bookedAt: { lt: b.bookedAt },
            },
          });
          return { ...b, canCancel: true, waitlistPosition: aheadCount + 1 };
        }

        const hoursUntilStart =
          (b.class.startTime.getTime() - now.getTime()) / (60 * 60 * 1000);
        return {
          ...b,
          canCancel: hoursUntilStart >= CANCELLATION_CUTOFF_HOURS,
        };
      }),
    );
  }

  /** Member cancelling their own booking — enforces the cutoff window on
   * BOOKED seats (spec: "with cutoff window, e.g. 2 hrs before"). Waitlist
   * entries can always be dropped since they don't hold a seat. */
  async cancelForSelf(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { class: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'BOOKED') {
      const hoursUntilStart =
        (booking.class.startTime.getTime() - Date.now()) / (60 * 60 * 1000);
      if (hoursUntilStart < CANCELLATION_CUTOFF_HOURS) {
        throw new BadRequestException(
          `Bookings can only be cancelled at least ${CANCELLATION_CUTOFF_HOURS} hours before the class starts`,
        );
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }
}
