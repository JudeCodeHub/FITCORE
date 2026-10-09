import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { JwtService } from '@nestjs/jwt';
import type { MailerService } from '../mailer/mailer.service.js';

function setup() {
  const prisma = {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    session: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  };
  const jwt = { signAsync: vi.fn(), verifyAsync: vi.fn() };
  const mailer = { sendVerificationEmail: vi.fn() };
  const service = new AuthService(
    prisma as unknown as PrismaService,
    jwt as unknown as JwtService,
    mailer as unknown as MailerService,
  );
  return { prisma, jwt, mailer, service };
}

const member = {
  id: 'member-1', name: 'Member', email: 'member@example.test',
  role: 'MEMBER', qrCodeId: 'qr-1', isActive: true, emailVerified: false,
};

describe('verified email access', () => {
  it('creates an unverified member without issuing a session', async () => {
    const { prisma, jwt, mailer, service } = setup();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(member);
    const result = await service.signup({ name: member.name, email: member.email, password: 'password123' });
    expect(result.message).toMatch(/Verify your email/);
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ role: 'MEMBER', verificationToken: expect.any(String) }),
    }));
    expect(mailer.sendVerificationEmail).toHaveBeenCalledOnce();
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('blocks login and refresh until verification, then allows login', async () => {
    const { prisma, jwt, service } = setup();
    const passwordHash = await bcrypt.hash('password123', 4);
    prisma.user.findUnique.mockResolvedValue({ ...member, passwordHash });
    await expect(service.login({ email: member.email, password: 'password123' })).rejects.toBeInstanceOf(ForbiddenException);
    jwt.verifyAsync.mockResolvedValue({ sub: member.id });
    prisma.session.findUnique.mockResolvedValue({ id: 'session-1', userId: member.id, revokedAt: null, expiresAt: new Date(Date.now() + 60_000) });
    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(ForbiddenException);
    prisma.user.findUnique.mockResolvedValue({ ...member, passwordHash, emailVerified: true });
    jwt.signAsync.mockResolvedValueOnce('access').mockResolvedValueOnce('refresh');
    prisma.session.create.mockResolvedValue({ id: 'new-session' });
    const signedIn = await service.login({ email: member.email, password: 'password123' });
    expect(signedIn.accessToken).toBe('access');
  });

  it('rejects an old access token for an unverified account', async () => {
    const { prisma, jwt } = setup();
    const guard = new JwtAuthGuard(jwt as unknown as JwtService, prisma as unknown as PrismaService);
    const request = { headers: { authorization: 'Bearer old-token' } };
    const context = { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
    jwt.verifyAsync.mockResolvedValue({ sub: member.id, email: member.email, role: 'ADMIN' });
    prisma.user.findUnique.mockResolvedValue(member);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    prisma.user.findUnique.mockResolvedValue({ ...member, emailVerified: true });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect((request as typeof request & { user: { role: string } }).user.role).toBe('MEMBER');
  });

  it('resends without revealing whether an account exists', async () => {
    const { prisma, mailer, service } = setup();
    prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(member);
    const missing = await service.resendVerification('missing@example.test');
    const existing = await service.resendVerification(member.email);
    expect(missing.message).toBe(existing.message);
    expect(prisma.user.update).toHaveBeenCalledOnce();
    expect(mailer.sendVerificationEmail).toHaveBeenCalledOnce();
  });
});
