import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const CONCURRENT_REQUESTS = Number(process.env.CONCURRENCY ?? 10);
const CAPACITY = Number(process.env.CAPACITY ?? 1);
const PASSWORD = 'password123';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`login failed for ${email}: HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.accessToken;
}

async function main() {
  console.log('\nBooking concurrency test');
  console.log(`  capacity: ${CAPACITY}`);
  console.log(`  concurrent requests: ${CONCURRENT_REQUESTS}\n`);

  const suffix = Date.now();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const trainer = await prisma.user.create({
    data: {
      role: 'TRAINER',
      name: 'Concurrency Test Trainer',
      email: `concurrency-trainer-${suffix}@fitcore.dev`,
      passwordHash,
    },
  });

  const members = [];
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    members.push(
      await prisma.user.create({
        data: {
          role: 'MEMBER',
          name: `Concurrency Member ${i}`,
          email: `concurrency-member-${suffix}-${i}@fitcore.dev`,
          passwordHash,
        },
      }),
    );
  }

  const cls = await prisma.class.create({
    data: {
      name: 'Concurrency Test Class',
      trainerId: trainer.id,
      capacity: CAPACITY,
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    },
  });

  let exitCode = 1;
  try {
    const tokens = await Promise.all(
      members.map((m) => login(m.email, PASSWORD)),
    );

    console.log('Firing all requests at the exact same instant...\n');
    const results = await Promise.all(
      tokens.map(async (token, i) => {
        const res = await fetch(`${API_URL}/bookings/me`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ classId: cls.id }),
        });
        const body = await res.json();
        return { member: i, httpStatus: res.status, bookingStatus: body.status };
      }),
    );

    for (const r of results) {
      console.log(`  member ${r.member}: HTTP ${r.httpStatus} -> ${r.bookingStatus}`);
    }

    const bookedCount = results.filter((r) => r.bookingStatus === 'BOOKED').length;
    const waitlistedCount = results.filter((r) => r.bookingStatus === 'WAITLISTED').length;

    const dbBookings = await prisma.booking.findMany({ where: { classId: cls.id } });
    const dbBookedCount = dbBookings.filter((b) => b.status === 'BOOKED').length;
    const dbWaitlistedCount = dbBookings.filter((b) => b.status === 'WAITLISTED').length;
    const noDuplicateUsers =
      new Set(dbBookings.map((b) => b.userId)).size === dbBookings.length;
    const noLostWrites = dbBookings.length === CONCURRENT_REQUESTS;

    console.log(`\nAPI responses:  ${bookedCount} booked, ${waitlistedCount} waitlisted`);
    console.log(
      `Database state: ${dbBookedCount} booked, ${dbWaitlistedCount} waitlisted, ${dbBookings.length} total rows`,
    );

    const pass =
      bookedCount === CAPACITY &&
      dbBookedCount === CAPACITY &&
      noDuplicateUsers &&
      noLostWrites &&
      bookedCount + waitlistedCount === CONCURRENT_REQUESTS;

    if (pass) {
      console.log(
        `\n✅ PASS — exactly ${CAPACITY} booked under ${CONCURRENT_REQUESTS} concurrent requests, no overbooking, no duplicate/lost writes.\n`,
      );
      exitCode = 0;
    } else {
      console.log(
        `\n❌ FAIL — expected exactly ${CAPACITY} booked with no duplicate/lost writes.\n`,
      );
      exitCode = 1;
    }
  } finally {
    await prisma.booking.deleteMany({ where: { classId: cls.id } });
    await prisma.class.delete({ where: { id: cls.id } });
    await prisma.user.deleteMany({
      where: { id: { in: [trainer.id, ...members.map((m) => m.id)] } },
    });
    await prisma.$disconnect();
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
