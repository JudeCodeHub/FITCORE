import { describe, expect, it, vi } from 'vitest';
import { BookingsService } from './bookings.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { MailerService } from '../mailer/mailer.service.js';
import type { NotificationsService } from '../notifications/notifications.service.js';

const startTime = new Date('2026-10-10T12:00:00.000Z');
const now = new Date('2026-10-09T16:00:00.000Z');
const booking = {
  id: 'booking-1',
  user: { id: 'user-1', email: 'member@example.test' },
  class: { name: 'Yoga', startTime },
};

function setup() {
  const tx = {
    booking: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    notification: { create: vi.fn().mockResolvedValue({ id: 'notification-1' }) },
  };
  const prisma = {
    booking: { findMany: vi.fn().mockResolvedValue([booking]) },
    $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<boolean>) => fn(tx)),
  };
  const mailer = { sendClassReminderEmail: vi.fn() };
  const service = new BookingsService(
    prisma as unknown as PrismaService,
    mailer as unknown as MailerService,
    {} as NotificationsService,
  );
  return { service, prisma, tx, mailer };
}

describe('class reminders', () => {
  it('claims an upcoming booked place once and creates one notification', async () => {
    const { service, prisma, tx, mailer } = setup();
    expect(await service.sendClassReminders(now)).toEqual({ checked: 1, sent: 1 });
    expect(prisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: 'BOOKED', reminderSentAt: null }),
    }));
    expect(tx.booking.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: booking.id, status: 'BOOKED', reminderSentAt: null }),
    }));
    expect(tx.notification.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: booking.user.id, type: 'CLASS_REMINDER' }),
    }));
    expect(mailer.sendClassReminderEmail).toHaveBeenCalledOnce();

    tx.booking.updateMany.mockResolvedValue({ count: 0 });
    expect(await service.sendClassReminders(now)).toEqual({ checked: 1, sent: 0 });
    expect(tx.notification.create).toHaveBeenCalledOnce();
    expect(mailer.sendClassReminderEmail).toHaveBeenCalledOnce();
  });

  it('does not email when notification insertion fails', async () => {
    const { service, tx, mailer } = setup();
    tx.notification.create.mockRejectedValue(new Error('database failure'));
    expect(await service.sendClassReminders(now)).toEqual({ checked: 1, sent: 0 });
    expect(mailer.sendClassReminderEmail).not.toHaveBeenCalled();
  });
});
