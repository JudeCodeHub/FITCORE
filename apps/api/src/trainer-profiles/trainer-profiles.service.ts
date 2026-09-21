import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpsertTrainerProfileDto } from './dto/upsert-trainer-profile.dto.js';

@Injectable()
export class TrainerProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  upsertMine(userId: string, dto: UpsertTrainerProfileDto) {
    return this.prisma.trainerProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: dto.bio,
        specialties: dto.specialties ?? [],
        certifications: dto.certifications ?? [],
        photoUrl: dto.photoUrl,
      },
      update: {
        bio: dto.bio,
        specialties: dto.specialties ?? [],
        certifications: dto.certifications ?? [],
        photoUrl: dto.photoUrl,
      },
    });
  }

  findMine(userId: string) {
    return this.prisma.trainerProfile.findUnique({ where: { userId } });
  }

  findAll() {
    return this.prisma.user.findMany({
      where: { role: 'TRAINER' },
      select: { id: true, name: true, trainerProfile: true },
      orderBy: { name: 'asc' },
    });
  }

  async findByTrainer(trainerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: trainerId },
      select: { id: true, name: true, role: true },
    });
    if (!user || user.role !== 'TRAINER') {
      throw new NotFoundException('Trainer not found');
    }

    const profile = await this.prisma.trainerProfile.findUnique({
      where: { userId: trainerId },
    });

    return { user: { id: user.id, name: user.name }, profile };
  }
}
