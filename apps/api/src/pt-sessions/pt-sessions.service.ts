import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MailerService } from '../mailer/mailer.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TrainerAvailabilityService } from '../trainer-availability/trainer-availability.service.js';
import type { CreatePtSessionDto } from './dto/create-pt-session.dto.js';

type RequestingUser = { sub: string; role: string };

@Injectable()
export class PtSessionsService {
  private readonly logger = new Logger(PtSessionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: TrainerAvailabilityService,
    private readonly mailer: MailerService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreatePtSessionDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const trainer = await this.prisma.user.findUnique({
      where: { id: dto.trainerId },
    });
    if (!trainer || trainer.role !== 'TRAINER') {
      throw new BadRequestException('trainerId must reference a trainer account');
    }

    const member = await this.prisma.user.findUnique({
      where: { id: dto.memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    await this.availability.assertWithinAvailability(dto.trainerId, start, end);

    const trainerConflict = await this.prisma.pTSession.findFirst({
      where: {
        trainerId: dto.trainerId,
        status: 'BOOKED',
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (trainerConflict) {
      throw new ConflictException('This trainer already has a session booked in that time range');
    }

    const memberConflict = await this.prisma.pTSession.findFirst({
      where: {
        memberId: dto.memberId,
        status: 'BOOKED',
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (memberConflict) {
      throw new ConflictException('This member already has a session booked in that time range');
    }

    const session = await this.prisma.pTSession.create({
      data: {
        trainerId: dto.trainerId,
        memberId: dto.memberId,
        startTime: start,
        endTime: end,
      },
    });

    try {
      this.mailer.sendPtSessionConfirmationEmail(
        member.email,
        trainer.name,
        start,
      );
      this.mailer.sendPtSessionConfirmationEmail(
        trainer.email,
        member.name,
        start,
      );
      await Promise.all([
        this.notifications.create({
          userId: member.id,
          type: 'PT_SESSION_CONFIRMATION',
          title: 'PT session confirmed',
          message: `Your session with ${trainer.name} is confirmed for ${start.toLocaleString()}.`,
        }),
        this.notifications.create({
          userId: trainer.id,
          type: 'PT_SESSION_CONFIRMATION',
          title: 'PT session booked',
          message: `You have a new session with ${member.name} at ${start.toLocaleString()}.`,
        }),
      ]);
    } catch (err) {
      this.logger.warn(`Failed to send PT session notification: ${String(err)}`);
    }

    return session;
  }

  async findMine(userId: string) {
    return this.prisma.pTSession.findMany({
      where: {
        status: 'BOOKED',
        OR: [{ trainerId: userId }, { memberId: userId }],
      },
      include: {
        trainer: { select: { id: true, name: true } },
        member: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.pTSession.findMany({
      where: { status: 'BOOKED' },
      include: {
        trainer: { select: { id: true, name: true } },
        member: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async cancel(id: string, requester: RequestingUser) {
    const session = await this.prisma.pTSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('PT session not found');

    const isOwner =
      requester.sub === session.trainerId || requester.sub === session.memberId;
    if (requester.role !== 'ADMIN' && !isOwner) {
      throw new ForbiddenException('You can only cancel your own PT sessions');
    }

    if (session.status === 'CANCELLED') {
      throw new BadRequestException('PT session is already cancelled');
    }

    return this.prisma.pTSession.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }
}
