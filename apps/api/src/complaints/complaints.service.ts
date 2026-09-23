import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateComplaintDto } from './dto/create-complaint.dto.js';
import type { ListComplaintsQueryDto } from './dto/list-complaints-query.dto.js';
import type { UpdateComplaintDto } from './dto/update-complaint.dto.js';

const complaintInclude = {
  submittedBy: { select: { id: true, name: true, role: true } },
  resolvedBy: { select: { id: true, name: true, role: true } },
} as const;

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  create(submittedById: string, dto: CreateComplaintDto) {
    return this.prisma.complaint.create({
      data: {
        submittedById,
        type: dto.type,
        subject: dto.subject,
        message: dto.message,
      },
      include: complaintInclude,
    });
  }

  /** The admin inbox — every complaint/suggestion, optionally filtered. */
  findAll(query: ListComplaintsQueryDto) {
    return this.prisma.complaint.findMany({
      where: {
        status: query.status,
        type: query.type,
      },
      include: complaintInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findMine(submittedById: string) {
    return this.prisma.complaint.findMany({
      where: { submittedById },
      include: complaintInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: complaintInclude,
    });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }
    return complaint;
  }

  async updateStatus(
    id: string,
    resolvedById: string,
    dto: UpdateComplaintDto,
  ) {
    await this.findOne(id);
    const isResolving = dto.status === 'RESOLVED';

    return this.prisma.complaint.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedById: isResolving ? resolvedById : null,
        resolvedAt: isResolving ? new Date() : null,
      },
      include: complaintInclude,
    });
  }
}
