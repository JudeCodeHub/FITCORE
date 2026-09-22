import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TrainerAvailabilityService } from '../trainer-availability/trainer-availability.service.js';
import type { CreateClassDto } from './dto/create-class.dto.js';
import type { CreateRecurringClassDto } from './dto/create-recurring-class.dto.js';
import type { ListClassesQueryDto } from './dto/list-classes-query.dto.js';
import type { UpdateClassDto } from './dto/update-class.dto.js';

type RequestingUser = { sub: string; role: string };

const ICAL_DAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_ATTENDANCE_WINDOW_DAYS = 90;
const MAX_ATTENDANCE_WINDOW_DAYS = 365;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function assertTimeRange(startTime: string, endTime: string) {
  if (new Date(endTime) <= new Date(startTime)) {
    throw new BadRequestException('endTime must be after startTime');
  }
}

@Injectable()
export class ClassesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: TrainerAvailabilityService,
  ) {}

  async findAll(query: ListClassesQueryDto) {
    const classes = await this.prisma.class.findMany({
      where: {
        ...(query.from || query.to
          ? {
              startTime: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
              },
            }
          : {}),
      },
      include: {
        trainer: { select: { id: true, name: true } },
        bookings: { where: { status: 'BOOKED' }, select: { id: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return classes.map(this.withSeatInfo);
  }

  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        trainer: { select: { id: true, name: true } },
        bookings: { where: { status: 'BOOKED' }, select: { id: true } },
      },
    });
    if (!cls) throw new NotFoundException('Class not found');
    return this.withSeatInfo(cls);
  }

  async create(dto: CreateClassDto, requester: RequestingUser) {
    assertTimeRange(dto.startTime, dto.endTime);
    const trainerId = await this.resolveTrainerId(dto.trainerId, requester);
    await this.availability.assertWithinAvailability(
      trainerId,
      new Date(dto.startTime),
      new Date(dto.endTime),
    );

    return this.prisma.class.create({
      data: {
        name: dto.name,
        trainerId,
        capacity: dto.capacity,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        recurrenceRule: dto.recurrenceRule,
      },
    });
  }

  /** Generates the individual sessions for a recurring class template —
   * e.g. "Yoga every Mon/Wed/Fri at 8am" becomes N real Class rows, all
   * sharing one seriesId and the same iCal-style recurrenceRule string. */
  async generateRecurring(
    dto: CreateRecurringClassDto,
    requester: RequestingUser,
  ) {
    assertTimeRange(dto.startTime, dto.endTime);
    const trainerId = await this.resolveTrainerId(dto.trainerId, requester);

    const days = Array.from(new Set(dto.daysOfWeek)).sort((a, b) => a - b);
    const firstStart = new Date(dto.startTime);
    const durationMs = new Date(dto.endTime).getTime() - firstStart.getTime();
    const seriesId = randomBytes(12).toString('hex');
    const recurrenceRule = `FREQ=WEEKLY;BYDAY=${days.map((d) => ICAL_DAY[d]).join(',')}`;

    const occurrences: { startTime: Date; endTime: Date }[] = [];
    const cursor = new Date(
      firstStart.getFullYear(),
      firstStart.getMonth(),
      firstStart.getDate(),
    );
    while (occurrences.length < dto.occurrenceCount) {
      if (days.includes(cursor.getDay())) {
        const occStart = new Date(cursor);
        occStart.setHours(
          firstStart.getHours(),
          firstStart.getMinutes(),
          firstStart.getSeconds(),
          0,
        );
        occurrences.push({
          startTime: occStart,
          endTime: new Date(occStart.getTime() + durationMs),
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const occ of occurrences) {
      await this.availability.assertWithinAvailability(
        trainerId,
        occ.startTime,
        occ.endTime,
      );
    }

    const created = await this.prisma.$transaction(
      occurrences.map((occ) =>
        this.prisma.class.create({
          data: {
            name: dto.name,
            trainerId,
            capacity: dto.capacity,
            startTime: occ.startTime,
            endTime: occ.endTime,
            recurrenceRule,
            seriesId,
          },
        }),
      ),
    );

    return { seriesId, recurrenceRule, count: created.length, classes: created };
  }

  async update(id: string, dto: UpdateClassDto, requester: RequestingUser) {
    const cls = await this.prisma.class.findUnique({ where: { id } });
    if (!cls) throw new NotFoundException('Class not found');

    this.assertOwnership(cls.trainerId, requester);

    if (dto.startTime || dto.endTime) {
      assertTimeRange(
        dto.startTime ?? cls.startTime.toISOString(),
        dto.endTime ?? cls.endTime.toISOString(),
      );
    }

    if (dto.trainerId && requester.role !== 'ADMIN') {
      throw new ForbiddenException('Only an admin can reassign a class to a different trainer');
    }

    if (dto.startTime || dto.endTime || dto.trainerId) {
      await this.availability.assertWithinAvailability(
        dto.trainerId ?? cls.trainerId,
        dto.startTime ? new Date(dto.startTime) : cls.startTime,
        dto.endTime ? new Date(dto.endTime) : cls.endTime,
      );
    }

    return this.prisma.class.update({
      where: { id },
      data: {
        name: dto.name,
        trainerId: dto.trainerId,
        capacity: dto.capacity,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        recurrenceRule: dto.recurrenceRule,
      },
    });
  }

  async remove(id: string, requester: RequestingUser) {
    const cls = await this.prisma.class.findUnique({ where: { id } });
    if (!cls) throw new NotFoundException('Class not found');

    this.assertOwnership(cls.trainerId, requester);

    await this.prisma.class.delete({ where: { id } });
  }

  private async resolveTrainerId(
    dtoTrainerId: string | undefined,
    requester: RequestingUser,
  ): Promise<string> {
    const trainerId =
      requester.role === 'TRAINER' ? requester.sub : dtoTrainerId;

    if (!trainerId) {
      throw new BadRequestException('trainerId is required');
    }

    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
    });
    if (!trainer || trainer.role !== 'TRAINER') {
      throw new BadRequestException('trainerId must reference a trainer account');
    }

    return trainerId;
  }

  private assertOwnership(trainerId: string, requester: RequestingUser) {
    if (requester.role === 'ADMIN') return;
    if (requester.role === 'TRAINER' && requester.sub === trainerId) return;
    throw new ForbiddenException('You can only manage your own classes');
  }

  /** Most/least popular classes by fill rate over a trailing window.
   * There's no attendance/check-in record tied to a specific class (the
   * `CheckIn` model is a generic gym entry, not linked to `classId`), so
   * "attendance" is approximated as BOOKED bookings on classes that have
   * already concluded (`endTime` inside the window) — WAITLISTED bookings
   * never got a seat and are reported separately as a demand signal, not
   * counted as attendance. Occurrences are grouped by `name`, since a
   * recurring class's individual sessions (sharing one `seriesId`) are the
   * same class type running repeatedly, not distinct classes to rank
   * separately. */
  async getAttendanceAnalytics(days?: number) {
    const windowDays = Math.min(
      Math.max(days ?? DEFAULT_ATTENDANCE_WINDOW_DAYS, 1),
      MAX_ATTENDANCE_WINDOW_DAYS,
    );
    const until = new Date();
    const since = new Date(until.getTime() - windowDays * MS_PER_DAY);

    const classes = await this.prisma.class.findMany({
      where: { endTime: { gte: since, lte: until } },
      select: {
        name: true,
        capacity: true,
        bookings: {
          where: { status: { in: ['BOOKED', 'WAITLISTED'] } },
          select: { status: true },
        },
      },
    });

    const byName = new Map<
      string,
      {
        name: string;
        occurrenceCount: number;
        totalCapacity: number;
        totalAttended: number;
        totalWaitlisted: number;
      }
    >();

    for (const cls of classes) {
      const entry = byName.get(cls.name) ?? {
        name: cls.name,
        occurrenceCount: 0,
        totalCapacity: 0,
        totalAttended: 0,
        totalWaitlisted: 0,
      };
      entry.occurrenceCount += 1;
      entry.totalCapacity += cls.capacity;
      for (const b of cls.bookings) {
        if (b.status === 'BOOKED') entry.totalAttended += 1;
        else entry.totalWaitlisted += 1;
      }
      byName.set(cls.name, entry);
    }

    const rows = Array.from(byName.values())
      .map((e) => ({
        ...e,
        avgFillRatePercent:
          e.totalCapacity > 0
            ? round2((e.totalAttended / e.totalCapacity) * 100)
            : 0,
      }))
      .sort((a, b) => b.avgFillRatePercent - a.avgFillRatePercent);

    return {
      windowDays,
      since,
      until,
      classes: rows,
      mostPopular: rows[0] ?? null,
      leastPopular: rows.length > 0 ? rows[rows.length - 1] : null,
    };
  }

  private withSeatInfo<T extends { capacity: number; bookings: { id: string }[] }>(
    cls: T,
  ) {
    const { bookings, ...rest } = cls;
    return {
      ...rest,
      bookedCount: bookings.length,
      availableSeats: Math.max(0, cls.capacity - bookings.length),
    };
  }
}
