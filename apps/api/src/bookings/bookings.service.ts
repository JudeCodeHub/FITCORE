import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Books a seat if one's open, otherwise waitlists — never rejects
   * outright just because a class is full.
   *
   * NOTE (deliberate scope limit): the "is there a seat free" check and the
   * "create the booking" write are two separate queries here, not one
   * atomic operation. Under concurrent requests for the last seat, both
   * could pass the check before either writes, overbooking the class.
   * That race-condition fix is its own checklist item right after this
   * one (transaction/unique-constraint based) — this step is just the
   * capacity/waitlist decision logic itself. */
  async create(dto: CreateBookingDto) {
    const cls = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });
    if (!cls) throw new NotFoundException('Class not found');

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.booking.findFirst({
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

    const bookedCount = await this.prisma.booking.count({
      where: { classId: dto.classId, status: 'BOOKED' },
    });

    const booking = await this.prisma.booking.create({
      data: {
        classId: dto.classId,
        userId: dto.userId,
        status: bookedCount < cls.capacity ? 'BOOKED' : 'WAITLISTED',
      },
    });

    if (booking.status === 'WAITLISTED') {
      const position = await this.getWaitlistPosition(booking.id);
      return { ...booking, waitlistPosition: position };
    }

    return booking;
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

  /** Cancels a booking. Deliberately does NOT promote the next waitlisted
   * person into the freed seat — that's the "auto-promotion" checklist
   * item, built separately once this exists to build on. */
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

  private async getWaitlistPosition(bookingId: string): Promise<number> {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
    });
    const aheadCount = await this.prisma.booking.count({
      where: {
        classId: booking.classId,
        status: 'WAITLISTED',
        bookedAt: { lt: booking.bookedAt },
      },
    });
    return aheadCount + 1;
  }
}
