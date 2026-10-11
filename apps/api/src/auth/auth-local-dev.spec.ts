import { afterEach, describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { JwtService } from '@nestjs/jwt';
import type { MailerService } from '../mailer/mailer.service.js';

function setup() {
  const prisma = {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    session: { create: vi.fn().mockResolvedValue({ id: 'session-1' }) },
  };
  const jwt = { signAsync: vi.fn().mockResolvedValueOnce('access').mockResolvedValueOnce('refresh') };
  const mailer = { sendVerificationEmail: vi.fn() };
  const service = new AuthService(prisma as unknown as PrismaService, jwt as unknown as JwtService, mailer as unknown as MailerService);
  return { prisma, mailer, service };
}

afterEach(() => vi.unstubAllEnvs());

describe('local-only signup without SMTP', () => {
  it('creates a verified member without sending mail when explicitly enabled on a loopback database', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DATABASE_URL', 'postgresql://fitcore:fitcore@localhost:5432/fitcore');
    vi.stubEnv('FITCORE_DEV_AUTO_VERIFY_EMAIL', 'true');
    const { prisma, mailer, service } = setup();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'member-1', email: 'member@example.test' });
    expect(await service.signup({ name: 'Member', email: 'member@example.test', password: 'password123' })).toEqual({
      message: 'Account created. You can now sign in.', verificationRequired: false,
    });
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ role: 'MEMBER', emailVerified: true, verificationToken: null }),
    }));
    expect(mailer.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('verifies an existing unverified local account only after the correct password', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DATABASE_URL', 'postgresql://fitcore:fitcore@127.0.0.1:5432/fitcore');
    vi.stubEnv('FITCORE_DEV_AUTO_VERIFY_EMAIL', 'true');
    const { prisma, service } = setup();
    const user = {
      id: 'member-1', name: 'Member', email: 'member@example.test', role: 'MEMBER',
      qrCodeId: 'qr-1', isActive: true, emailVerified: false,
      passwordHash: await bcrypt.hash('password123', 4),
    };
    prisma.user.findUnique.mockResolvedValue(user);
    await expect(service.login({ email: user.email, password: 'wrong' })).rejects.toThrow();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect((await service.login({ email: user.email, password: 'password123' })).accessToken).toBe('access');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null, verificationTokenExpiresAt: null },
    });
  });

  it('never skips verification for a non-local database', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@db.example.test:5432/fitcore');
    vi.stubEnv('FITCORE_DEV_AUTO_VERIFY_EMAIL', 'true');
    const { prisma, mailer, service } = setup();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ email: 'member@example.test' });
    await service.signup({ name: 'Member', email: 'member@example.test', password: 'password123' });
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ emailVerified: false, verificationToken: expect.any(String) }),
    }));
    expect(mailer.sendVerificationEmail).toHaveBeenCalledOnce();
  });
});
