import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '../generated/prisma/client.js';
import { MailerService } from '../mailer/mailer.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';

const CANCELLATION_CUTOFF_HOURS = 2;

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateBookingDto) {
    const booking = await this.prisma.$transaction(async (tx) => {
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

    try {
      await this.notifyBooked(dto.userId, dto.classId, booking);
    } catch (err) {
      this.logger.warn(`Failed to send booking notification: ${String(err)}`);
    }

    return booking;
  }

  private async notifyBooked(
    userId: string,
    classId: string,
    booking: { status: string },
  ) {
    const [user, cls] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.class.findUnique({ where: { id: classId } }),
    ]);
    if (!user || !cls) return;

    if (booking.status === 'WAITLISTED') {
      const position = await this.prisma.booking.count({
        where: { classId, status: 'WAITLISTED' },
      });
      await this.mailer.sendWaitlistedEmail(user.email, cls.name, position);
      await this.notifications.create({
        userId: user.id,
        type: 'BOOKING_CONFIRMATION',
        title: 'Added to waitlist',
        message: `You're #${position} on the waitlist for ${cls.name}.`,
      });
    } else {
      await this.mailer.sendBookingConfirmationEmail(
        user.email,
        cls.name,
        cls.startTime,
      );
      await this.notifications.create({
        userId: user.id,
        type: 'BOOKING_CONFIRMATION',
        title: 'Booking confirmed',
        message: `You're booked for ${cls.name} on ${cls.startTime.toLocaleString()}.`,
      });
    }
  }

  /** The in-app notification and claim commit together. Email remains a
   * best-effort local stub until the mail-adapter step; replay cannot create
   * a second in-app reminder for the same booking. */
  @Cron(CronExpression.EVERY_HOUR)
  async sendClassReminders(now = new Date()) {
    const until = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcoming = await this.prisma.booking.findMany({
      where: {
        status: 'BOOKED',
        reminderSentAt: null,
        class: { is: { startTime: { gt: now, lte: until } } },
      },
      include: {
        class: { select: { name: true, startTime: true } },
        user: { select: { id: true, email: true } },
      },
      orderBy: { class: { startTime: 'asc' } },
      take: 200,
    });
    let sent = 0;
    for (const booking of upcoming) {
      try {
        const claimed = await this.prisma.$transaction(async (tx) => {
          const updated = await tx.booking.updateMany({
            where: {
              id: booking.id,
              status: 'BOOKED',
              reminderSentAt: null,
              class: { is: { startTime: { gt: now, lte: until } } },
            },
            data: { reminderSentAt: now },
          });
          if (updated.count === 0) return false;
          await tx.notification.create({
            data: {
              userId: booking.user.id,
              type: 'CLASS_REMINDER',
              title: 'Class starting soon',
              message: `${booking.class.name} starts at ${booking.class.startTime.toLocaleString()}.`,
            },
          });
          return true;
        });
        if (!claimed) continue;
        sent++;
        try {
          await this.mailer.sendClassReminderEmail(
            booking.user.email,
            booking.class.name,
            booking.class.startTime,
          );
        } catch (error) {
          this.logger.warn(`Failed to send class reminder email for booking ${booking.id}: ${String(error)}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to create class reminder for booking ${booking.id}: ${String(error)}`);
      }
    }
    return { checked: upcoming.length, sent };
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
    const initial = await this.prisma.booking.findUnique({ where: { id } });
    if (!initial) throw new NotFoundException('Booking not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Class" WHERE id = ${initial.classId} FOR UPDATE`;

      const booking = await tx.booking.findUniqueOrThrow({ where: { id } });
      if (booking.status === 'CANCELLED') {
        throw new BadRequestException('Booking is already cancelled');
      }

      return this.cancelAndPromote(tx, booking);
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

  async cancelForSelf(id: string, userId: string) {
    const initial = await this.prisma.booking.findUnique({ where: { id } });
    if (!initial) throw new NotFoundException('Booking not found');
    if (initial.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Class" WHERE id = ${initial.classId} FOR UPDATE`;

      const booking = await tx.booking.findUniqueOrThrow({
        where: { id },
        include: { class: true },
      });

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

      return this.cancelAndPromote(tx, booking);
    });
  }

  private async cancelAndPromote(
    tx: Prisma.TransactionClient,
    booking: { id: string; classId: string; status: string },
  ) {
    const wasBooked = booking.status === 'BOOKED';

    const cancelled = await tx.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    if (!wasBooked) return cancelled;

    const nextInLine = await tx.booking.findFirst({
      where: { classId: booking.classId, status: 'WAITLISTED' },
      orderBy: { bookedAt: 'asc' },
    });

    if (nextInLine) {
      await tx.booking.update({
        where: { id: nextInLine.id },
        data: { status: 'BOOKED' },
      });
    }

    return cancelled;
  }
}
