import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateMaintenanceTicketDto } from './dto/create-maintenance-ticket.dto.js';
import type { ListMaintenanceTicketsQueryDto } from './dto/list-maintenance-tickets-query.dto.js';
import type { UpdateMaintenanceTicketDto } from './dto/update-maintenance-ticket.dto.js';

const ticketInclude = {
  equipment: true,
  reportedBy: { select: { id: true, name: true, role: true } },
  resolvedBy: { select: { id: true, name: true, role: true } },
} as const;

@Injectable()
export class MaintenanceTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reportedById: string, dto: CreateMaintenanceTicketDto) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: dto.equipmentId },
    });
    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    return this.prisma.maintenanceTicket.create({
      data: {
        equipmentId: dto.equipmentId,
        reportedById,
        description: dto.description,
      },
      include: ticketInclude,
    });
  }

  findAll(query: ListMaintenanceTicketsQueryDto) {
    return this.prisma.maintenanceTicket.findMany({
      where: query.status ? { status: query.status } : undefined,
      include: ticketInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.maintenanceTicket.findUnique({
      where: { id },
      include: ticketInclude,
    });
    if (!ticket) {
      throw new NotFoundException('Maintenance ticket not found');
    }
    return ticket;
  }

  async updateStatus(
    id: string,
    resolvedById: string,
    dto: UpdateMaintenanceTicketDto,
  ) {
    await this.findOne(id);
    const isResolving = dto.status === 'RESOLVED';

    return this.prisma.maintenanceTicket.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedById: isResolving ? resolvedById : null,
        resolvedAt: isResolving ? new Date() : null,
      },
      include: ticketInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.maintenanceTicket.delete({ where: { id } });
  }
}
