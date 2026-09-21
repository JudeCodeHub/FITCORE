import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RequestUser } from '../auth/guards/jwt-auth.guard.js';
import type { CreateBodyMetricDto } from './dto/create-body-metric.dto.js';

function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

@Injectable()
export class BodyMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBodyMetricDto) {
    let heightCm = dto.heightCm ?? null;
    if (heightCm === null) {
      const lastWithHeight = await this.prisma.bodyMetric.findFirst({
        where: { userId, heightCm: { not: null } },
        orderBy: { recordedAt: 'desc' },
      });
      heightCm = lastWithHeight?.heightCm ?? null;
    }

    const metric = await this.prisma.bodyMetric.create({
      data: {
        userId,
        weightKg: dto.weightKg,
        heightCm,
        bodyFatPct: dto.bodyFatPct,
        measurements: dto.measurements,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : undefined,
      },
    });

    return this.attachBmi(metric);
  }

  async findAllForUser(userId: string) {
    const metrics = await this.prisma.bodyMetric.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });
    return metrics.map((m) => this.attachBmi(m));
  }

  async remove(id: string, requester: RequestUser) {
    const metric = await this.prisma.bodyMetric.findUnique({ where: { id } });
    if (!metric) {
      throw new NotFoundException('Body metric entry not found');
    }
    if (requester.role !== 'ADMIN' && requester.sub !== metric.userId) {
      throw new ForbiddenException('You can only delete your own entries');
    }
    await this.prisma.bodyMetric.delete({ where: { id } });
  }

  private attachBmi<T extends { weightKg: number; heightCm: number | null }>(
    metric: T,
  ) {
    return {
      ...metric,
      bmi: metric.heightCm ? calculateBmi(metric.weightKg, metric.heightCm) : null,
    };
  }
}
