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
