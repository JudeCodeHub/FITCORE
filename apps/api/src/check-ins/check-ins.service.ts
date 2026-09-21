import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CheckInsGateway } from './check-ins.gateway.js';
import type { CreateCheckInDto } from './dto/create-check-in.dto.js';

const ACTIVE_WINDOW_MINUTES = 120;
const DEFAULT_PEAK_HOURS_WINDOW_DAYS = 90;

interface PeakHoursRow {
  dayOfWeek: number;
  hourOfDay: number;
  count: number;
}

@Injectable()
export class CheckInsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: CheckInsGateway,
  ) {}

  async create(dto: CreateCheckInDto) {
    const user = await this.prisma.user.findUnique({
      where: { qrCodeId: dto.qrCodeId.trim() },
    });
    if (!user) {
      throw new NotFoundException('No member found with that code');
    }

    const checkIn = await this.prisma.checkIn.create({
      data: { userId: user.id },
    });

    const result = {
      checkIn,
      user: { id: user.id, name: user.name, role: user.role },
    };

    this.gateway.broadcastCheckIn(result);

    return result;
  }

  findRecent(limit = 20) {
    return this.prisma.checkIn.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
  }

  findMine(userId: string, limit = 100) {
    return this.prisma.checkIn.findMany({
      where: { userId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
  }

  async findActive() {
    const since = new Date(Date.now() - ACTIVE_WINDOW_MINUTES * 60 * 1000);
    const checkIns = await this.prisma.checkIn.findMany({
      where: { timestamp: { gte: since } },
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, name: true, role: true } } },
    });

    const seen = new Set<string>();
    const active = [];
    for (const checkIn of checkIns) {
      if (seen.has(checkIn.userId)) continue;
      seen.add(checkIn.userId);
      active.push(checkIn);
    }
    return active;
  }

  async getPeakHours(days?: number) {
    const windowDays = Math.min(
      Math.max(days ?? DEFAULT_PEAK_HOURS_WINDOW_DAYS, 1),
      365,
    );
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const rows = await this.prisma.$queryRaw<PeakHoursRow[]>`
      SELECT
        EXTRACT(DOW FROM "timestamp" AT TIME ZONE 'UTC')::int AS "dayOfWeek",
        EXTRACT(HOUR FROM "timestamp" AT TIME ZONE 'UTC')::int AS "hourOfDay",
        COUNT(*)::int AS "count"
      FROM "CheckIn"
      WHERE "timestamp" >= ${since}
      GROUP BY "dayOfWeek", "hourOfDay"
      ORDER BY "dayOfWeek", "hourOfDay"
    `;

    const grid: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0),
    );
    let peak = { dayOfWeek: 0, hourOfDay: 0, count: 0 };

    for (const row of rows) {
      grid[row.dayOfWeek][row.hourOfDay] = row.count;
      if (row.count > peak.count) {
        peak = {
          dayOfWeek: row.dayOfWeek,
          hourOfDay: row.hourOfDay,
          count: row.count,
        };
      }
    }

    return { grid, peak, windowDays };
  }
}
