import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { BookingsService } from './bookings.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { MailerService } from '../mailer/mailer.service.js';
import type { NotificationsService } from '../notifications/notifications.service.js';

function setup(bookedCount: number) {
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([{ capacity: 2 }]),
    user: { findUnique: vi.fn().mockResolvedValue({ id: 'member-1' }) },
    booking: {
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(bookedCount),
      create: vi.fn().mockImplementation(async ({ data }) => ({ id: 'booking-1', ...data, bookedAt: new Date() })),
    },
  };
  const prisma = {
    $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    user: { findUnique: vi.fn().mockResolvedValue({ id: 'member-1', email: 'member@example.test' }) },
    class: { findUnique: vi.fn().mockResolvedValue({ name: 'Yoga', startTime: new Date() }) },
  };
  const mailer = { sendBookingConfirmationEmail: vi.fn(), sendWaitlistedEmail: vi.fn() };
  const notifications = { create: vi.fn() };
  const service = new BookingsService(prisma as unknown as PrismaService, mailer as unknown as MailerService, notifications as unknown as NotificationsService);
  return { service, tx, mailer };
}

describe('booking journey', () => {
  it('books a member while capacity remains', async () => {
    const { service, tx, mailer } = setup(1);
    expect((await service.create({ classId: 'class-1', userId: 'member-1' })).status).toBe('BOOKED');
    expect(tx.booking.create).toHaveBeenCalledWith({ data: { classId: 'class-1', userId: 'member-1', status: 'BOOKED' } });
    expect(mailer.sendBookingConfirmationEmail).toHaveBeenCalledOnce();
  });
  it('waitlists at capacity and rejects duplicate active bookings', async () => {
    const { service, tx, mailer } = setup(2);
    expect((await service.create({ classId: 'class-1', userId: 'member-1' })).status).toBe('WAITLISTED');
    expect(mailer.sendWaitlistedEmail).toHaveBeenCalledOnce();
    tx.booking.findFirst.mockResolvedValue({ status: 'BOOKED' });
    await expect(service.create({ classId: 'class-1', userId: 'member-1' })).rejects.toBeInstanceOf(ConflictException);
  });
});
