CREATE TYPE "EquipmentStatus" AS ENUM ('OPERATIONAL', 'OUT_OF_SERVICE', 'RETIRED');

CREATE TYPE "MaintenanceTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMATION', 'CLASS_REMINDER', 'MEMBERSHIP_RENEWAL', 'PAYMENT_ALERT', 'PT_SESSION_CONFIRMATION', 'MAINTENANCE_UPDATE', 'GENERAL');

CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "status" "EquipmentStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MaintenanceTicket" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "MaintenanceTicketStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Equipment_status_idx" ON "Equipment"("status");

CREATE INDEX "MaintenanceTicket_equipmentId_idx" ON "MaintenanceTicket"("equipmentId");

CREATE INDEX "MaintenanceTicket_status_idx" ON "MaintenanceTicket"("status");

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
