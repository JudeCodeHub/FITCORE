import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CheckInsGateway } from './check-ins.gateway.js';
import type { CreateCheckInDto } from './dto/create-check-in.dto.js';

const ACTIVE_WINDOW_MINUTES = 120;

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
}
