import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateSettingsDto } from './dto/update-settings.dto.js';

const SETTINGS_ID = 'singleton';

const DEFAULT_HOURS = {
  monday: { open: '06:00', close: '22:00' },
  tuesday: { open: '06:00', close: '22:00' },
  wednesday: { open: '06:00', close: '22:00' },
  thursday: { open: '06:00', close: '22:00' },
  friday: { open: '06:00', close: '22:00' },
  saturday: { open: '08:00', close: '18:00' },
  sunday: { open: '08:00', close: '18:00' },
} satisfies Prisma.InputJsonValue;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lazily creates the one settings row with defaults on first read —
   * no seed migration needed, and every environment (including a fresh
   * test database) always has sane settings to fall back on. */
  get() {
    return this.prisma.gymSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, hours: DEFAULT_HOURS },
      update: {},
    });
  }

  /** Just the two numbers memberships.service.ts actually needs, so it
   * doesn't have to know anything about the rest of GymSettings' shape. */
  async getPolicy(): Promise<{
    freezeDaysPerYearLimit: number;
    cancellationNoticeDays: number;
  }> {
    const settings = await this.get();
    return {
      freezeDaysPerYearLimit: settings.freezeDaysPerYearLimit,
      cancellationNoticeDays: settings.cancellationNoticeDays,
    };
  }

  async update(updatedById: string, dto: UpdateSettingsDto) {
    await this.get(); // ensure the row exists before a plain update()

    return this.prisma.gymSettings.update({
      where: { id: SETTINGS_ID },
      data: {
        name: dto.name,
        timezone: dto.timezone,
        hours: dto.hours as unknown as Prisma.InputJsonValue,
        branches: dto.branches,
        freezeDaysPerYearLimit: dto.freezeDaysPerYearLimit,
        cancellationNoticeDays: dto.cancellationNoticeDays,
        updatedById,
      },
    });
  }
}
