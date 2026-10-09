import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import type { UpdateEquipmentDto } from './dto/update-equipment.dto.js';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.equipment.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
    });
    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }
    return equipment;
  }

  create(dto: CreateEquipmentDto) {
    return this.prisma.equipment.create({
      data: {
        name: dto.name,
        category: dto.category,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        status: dto.status,
        notes: dto.notes,
        maintenanceIntervalDays: dto.maintenanceIntervalDays,
        nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateEquipmentDto) {
    await this.findOne(id);
    return this.prisma.equipment.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        status: dto.status,
        notes: dto.notes,
        maintenanceIntervalDays: dto.maintenanceIntervalDays,
        nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : undefined,
      },
    });
  }

  async maintenanceHistory(id: string) {
    await this.findOne(id);
    return this.prisma.equipmentMaintenanceCompletion.findMany({
      where: { equipmentId: id }, orderBy: { completedAt: 'desc' },
      include: { completedBy: { select: { id: true, name: true } } },
    });
  }

  async completeMaintenance(id: string, completedById: string, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.findUnique({ where: { id } });
      if (!equipment) throw new NotFoundException('Equipment not found');
      if (!equipment.maintenanceIntervalDays || !equipment.nextMaintenanceAt) {
        throw new BadRequestException('No maintenance schedule is configured');
      }
      const completedAt = new Date();
      const nextMaintenanceAt = new Date(completedAt.getTime() + equipment.maintenanceIntervalDays * 86_400_000);
      const completion = await tx.equipmentMaintenanceCompletion.create({
        data: { equipmentId: id, completedById, completedAt, notes },
      });
      await tx.equipment.update({ where: { id }, data: { nextMaintenanceAt } });
      return completion;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.equipment.delete({ where: { id } });
  }
}
