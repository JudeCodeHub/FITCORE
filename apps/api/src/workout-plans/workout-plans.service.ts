import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RequestUser } from '../auth/guards/jwt-auth.guard.js';
import type { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto.js';
import type { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto.js';

const planInclude = {
  exercises: {
    orderBy: { order: 'asc' as const },
    include: { exercise: true },
  },
} as const;

@Injectable()
export class WorkoutPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(requester: RequestUser, dto: CreateWorkoutPlanDto) {
    await this.assertCanManageMember(requester, dto.memberId);

    return this.prisma.workoutPlan.create({
      data: {
        memberId: dto.memberId,
        createdById: requester.sub,
        name: dto.name,
        notes: dto.notes,
        exercises: {
          create: dto.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            order: e.order,
          })),
        },
      },
      include: planInclude,
    });
  }

  findMine(userId: string) {
    return this.prisma.workoutPlan.findMany({
      where: { memberId: userId },
      include: planInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForMember(requester: RequestUser, memberId: string) {
    await this.assertCanManageMember(requester, memberId);
    return this.prisma.workoutPlan.findMany({
      where: { memberId },
      include: planInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(requester: RequestUser, id: string) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        ...planInclude,
        member: { select: { assignedTrainerId: true } },
      },
    });
    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }

    const canView =
      requester.role === 'ADMIN' ||
      requester.sub === plan.memberId ||
      requester.sub === plan.createdById ||
      requester.sub === plan.member.assignedTrainerId;
    if (!canView) {
      throw new ForbiddenException('You cannot view this workout plan');
    }

    const { member: _member, ...rest } = plan;
    return rest;
  }

  async update(requester: RequestUser, id: string, dto: UpdateWorkoutPlanDto) {
    const plan = await this.prisma.workoutPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }
    this.assertCanEdit(requester, plan);

    return this.prisma.$transaction(async (tx) => {
      if (dto.exercises) {
        await tx.workoutPlanExercise.deleteMany({ where: { planId: id } });
      }
      return tx.workoutPlan.update({
        where: { id },
        data: {
          name: dto.name,
          notes: dto.notes,
          ...(dto.exercises && {
            exercises: {
              create: dto.exercises.map((e) => ({
                exerciseId: e.exerciseId,
                sets: e.sets,
                reps: e.reps,
                order: e.order,
              })),
            },
          }),
        },
        include: planInclude,
      });
    });
  }

  async remove(requester: RequestUser, id: string) {
    const plan = await this.prisma.workoutPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }
    this.assertCanEdit(requester, plan);
    await this.prisma.workoutPlan.delete({ where: { id } });
  }

  private async assertCanManageMember(requester: RequestUser, memberId: string) {
    if (requester.role === 'ADMIN') return;

    if (requester.role === 'MEMBER') {
      if (requester.sub !== memberId) {
        throw new ForbiddenException('You can only create plans for yourself');
      }
      return;
    }

    if (requester.role === 'TRAINER') {
      const member = await this.prisma.user.findUnique({
        where: { id: memberId },
      });
      if (!member || member.assignedTrainerId !== requester.sub) {
        throw new ForbiddenException(
          'You can only create plans for members assigned to you',
        );
      }
      return;
    }

    throw new ForbiddenException('Not allowed');
  }

  private assertCanEdit(requester: RequestUser, plan: { createdById: string }) {
    if (requester.role === 'ADMIN') return;
    if (requester.sub === plan.createdById) return;
    throw new ForbiddenException('You cannot modify this workout plan');
  }
}
