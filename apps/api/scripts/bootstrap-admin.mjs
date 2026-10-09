/** Create exactly one local administrator without a shared demo password. */
import 'dotenv/config';
import { stdin, stdout } from 'node:process';
import { URL } from 'node:url';
import { createRequire } from 'node:module';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const require = createRequire(import.meta.url);
const usage = 'Usage: npm run bootstrap:admin --workspace=apps/api -- <email> <name>';

function hiddenPrompt(label) {
  if (!stdin.isTTY) throw new Error('An interactive terminal is required for the password prompt.');
  return new Promise((resolve, reject) => {
    let value = '';
    const wasRaw = stdin.isRaw;
    stdout.write(label);
    const finish = (error) => {
      stdin.off('keypress', onKey);
      stdin.setRawMode(Boolean(wasRaw));
      stdin.pause();
      stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };
    const onKey = (character, key) => {
      if (key?.ctrl && key.name === 'c') return finish(new Error('Cancelled.'));
      if (key?.name === 'return' || key?.name === 'enter') return finish();
      if (key?.name === 'backspace') {
        value = value.slice(0, -1);
        return;
      }
      if (!key?.ctrl && !key?.meta && character) value += character;
    };
    require('node:readline').emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('keypress', onKey);
  });
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log(usage);
    return;
  }
  const [emailArg, nameArg, ...extra] = process.argv.slice(2);
  const email = emailArg?.trim().toLowerCase();
  const name = nameArg?.trim();
  if (extra.length || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || name.length < 2) {
    throw new Error(usage);
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Local bootstrap is disabled in production.');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in apps/api/.env.');
  const databaseUrl = new URL(process.env.DATABASE_URL);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(databaseUrl.hostname)) {
    throw new Error('Local bootstrap requires a loopback PostgreSQL host.');
  }
  const password = await hiddenPrompt('New admin password: ');
  const confirmation = await hiddenPrompt('Confirm password: ');
  if (password.length < 8 || password !== confirmation) {
    throw new Error('Passwords must match and contain at least 8 characters.');
  }

  const { PrismaClient } = await import('../dist/generated/prisma/client.js');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(157234891)`;
      if (await tx.user.count({ where: { role: 'ADMIN' } })) {
        throw new Error('An administrator already exists. Bootstrap will not change roles or passwords.');
      }
      if (await tx.user.findUnique({ where: { email } })) {
        throw new Error('This email already belongs to an account. Bootstrap will not promote it.');
      }
      await tx.user.create({
        data: { email, name, role: 'ADMIN', passwordHash, emailVerified: true },
      });
    });
    console.log(`Local administrator created: ${email}. Sign in at /login with the password you entered.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Bootstrap failed.');
  process.exitCode = 1;
});
