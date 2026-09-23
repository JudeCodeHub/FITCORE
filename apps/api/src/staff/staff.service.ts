import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { STAFF_ROLES } from '../auth/dto/invite-staff.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateStaffRoleDto } from './dto/update-staff-role.dto.js';

const staffSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      where: { role: { in: [...STAFF_ROLES] } },
      select: staffSelect,
      orderBy: { name: 'asc' },
    });
  }

  async updateRole(id: string, dto: UpdateStaffRoleDto) {
    const user = await this.findStaffOrThrow(id);
    if (user.role === 'ADMIN' && dto.role !== 'ADMIN') {
      await this.assertNotLastActiveAdmin(id);
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: staffSelect,
    });
  }

  /** Deactivating blocks future login/refresh (enforced in AuthService)
   * and immediately revokes every session this user currently holds, so
   * they're logged out on their very next request rather than only once
   * their access token happens to expire. */
  async deactivate(id: string) {
    const user = await this.findStaffOrThrow(id);
    if (user.role === 'ADMIN') {
      await this.assertNotLastActiveAdmin(id);
    }

    await this.prisma.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: staffSelect,
    });
  }

  async reactivate(id: string) {
    await this.findStaffOrThrow(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: staffSelect,
    });
  }

  private async findStaffOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (
      !user ||
      !STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number])
    ) {
      throw new NotFoundException('Staff member not found');
    }
    return user;
  }

  /** Refuses a role change or deactivation that would leave the gym with
   * zero active admins — that's a lockout with no path back in, since
   * only an admin can grant admin. */
  private async assertNotLastActiveAdmin(excludingId: string) {
    const otherActiveAdmins = await this.prisma.user.count({
      where: { role: 'ADMIN', isActive: true, id: { not: excludingId } },
    });
    if (otherActiveAdmins === 0) {
      throw new BadRequestException(
        'Cannot remove the last active admin account',
      );
    }
  }
}
