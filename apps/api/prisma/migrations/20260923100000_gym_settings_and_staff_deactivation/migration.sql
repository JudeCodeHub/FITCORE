ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "GymSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "name" TEXT NOT NULL DEFAULT 'FitCore Gym',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "hours" JSONB NOT NULL,
    "branches" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "freezeDaysPerYearLimit" INTEGER NOT NULL DEFAULT 30,
    "cancellationNoticeDays" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "GymSettings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "GymSettings" ADD CONSTRAINT "GymSettings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
