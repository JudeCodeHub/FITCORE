import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateAvailabilityDto } from './dto/create-availability.dto.js';

@Injectable()
export class TrainerAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(trainerId: string, dto: CreateAvailabilityDto) {
    if (dto.endMinute <= dto.startMinute) {
      throw new BadRequestException('endMinute must be after startMinute');
    }
    return this.prisma.trainerAvailability.create({
      data: {
        trainerId,
        dayOfWeek: dto.dayOfWeek,
        startMinute: dto.startMinute,
        endMinute: dto.endMinute,
      },
    });
  }

  findByTrainer(trainerId: string) {
    return this.prisma.trainerAvailability.findMany({
      where: { trainerId },
      orderBy: [{ dayOfWeek: 'asc' }, { startMinute: 'asc' }],
    });
  }

  async remove(id: string, requester: { sub: string; role: string }) {
    const record = await this.prisma.trainerAvailability.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException('Availability window not found');
    if (requester.role !== 'ADMIN' && requester.sub !== record.trainerId) {
      throw new ForbiddenException('You can only manage your own availability');
    }
    await this.prisma.trainerAvailability.delete({ where: { id } });
  }

  async assertWithinAvailability(
    trainerId: string,
    start: Date,
    end: Date,
  ): Promise<void> {
    const windows = await this.prisma.trainerAvailability.findMany({
      where: { trainerId },
    });
    if (windows.length === 0) return;

    const dayOfWeek = start.getUTCDay();
    const startMinute = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMinute = end.getUTCHours() * 60 + end.getUTCMinutes();

    const fits = windows.some(
      (w) =>
        w.dayOfWeek === dayOfWeek &&
        startMinute >= w.startMinute &&
        endMinute <= w.endMinute,
    );

    if (!fits) {
      throw new BadRequestException(
        'This time is outside the trainer’s available hours',
      );
    }
  }
}
