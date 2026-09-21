import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RequestUser } from '../auth/guards/jwt-auth.guard.js';
import type { LogPersonalRecordDto } from './dto/log-personal-record.dto.js';

/** Epley formula — lets lifts at different rep ranges be compared fairly
 * (e.g. 100kg x 5 vs 90kg x 8) instead of only ever comparing raw weight. */
function estimatedOneRepMax(weightKg: number, reps: number): number {
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

@Injectable()
export class PersonalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: LogPersonalRecordDto) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: dto.exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const record = await this.prisma.personalRecord.create({
      data: {
        userId,
        exerciseId: dto.exerciseId,
        weightKg: dto.weightKg,
        reps: dto.reps,
        achievedAt: dto.achievedAt ? new Date(dto.achievedAt) : undefined,
      },
      include: { exercise: true },
    });

    return this.attachEstimate(record);
  }

  async findAllForUser(userId: string) {
    const records = await this.prisma.personalRecord.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { achievedAt: 'desc' },
    });
    return records.map((r) => this.attachEstimate(r));
  }

  async findBestForUser(userId: string) {
    const records = await this.findAllForUser(userId);
    const bestByExercise = new Map<string, (typeof records)[number]>();

    for (const record of records) {
      const current = bestByExercise.get(record.exerciseId);
      if (!current || record.estimated1RM > current.estimated1RM) {
        bestByExercise.set(record.exerciseId, record);
      }
    }

    return Array.from(bestByExercise.values()).sort((a, b) =>
      a.exercise.name.localeCompare(b.exercise.name),
    );
  }

  async remove(id: string, requester: RequestUser) {
    const record = await this.prisma.personalRecord.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException('Personal record entry not found');
    }
    if (requester.role !== 'ADMIN' && requester.sub !== record.userId) {
      throw new ForbiddenException('You can only delete your own entries');
    }
    await this.prisma.personalRecord.delete({ where: { id } });
  }

  private attachEstimate<T extends { weightKg: number; reps: number }>(
    record: T,
  ) {
    return {
      ...record,
      estimated1RM: estimatedOneRepMax(record.weightKg, record.reps),
    };
  }
}
