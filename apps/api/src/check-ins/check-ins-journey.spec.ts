import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CheckInsService } from './check-ins.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { CheckInsGateway } from './check-ins.gateway.js';

describe('check-in journey', () => {
  const user = { id: 'member-1', name: 'Member', role: 'MEMBER' };
  function setup() {
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue(user) },
      checkIn: { create: vi.fn().mockResolvedValue({ id: 'checkin-1', userId: user.id }) },
    };
    const gateway = { broadcastCheckIn: vi.fn() };
    return { service: new CheckInsService(prisma as unknown as PrismaService, gateway as unknown as CheckInsGateway), prisma, gateway };
  }
  it('records and broadcasts a valid member QR check-in', async () => {
    const { service, prisma, gateway } = setup();
    const result = await service.create({ qrCodeId: ' qr-1 ' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { qrCodeId: 'qr-1' } });
    expect(prisma.checkIn.create).toHaveBeenCalledWith({ data: { userId: user.id } });
    expect(gateway.broadcastCheckIn).toHaveBeenCalledWith(result);
  });
  it('does not record an unknown QR code', async () => {
    const { service, prisma } = setup();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.create({ qrCodeId: 'unknown' })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.checkIn.create).not.toHaveBeenCalled();
  });
});
