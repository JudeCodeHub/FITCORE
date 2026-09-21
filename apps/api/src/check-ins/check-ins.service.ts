import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateCheckInDto } from './dto/create-check-in.dto.js';

@Injectable()
export class CheckInsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return {
      checkIn,
      user: { id: user.id, name: user.name, role: user.role },
    };
  }

  findRecent(limit = 20) {
    return this.prisma.checkIn.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
  }
}
