ALTER TABLE "Equipment" ADD COLUMN "maintenanceIntervalDays" INTEGER, ADD COLUMN "nextMaintenanceAt" TIMESTAMP(3);
CREATE TABLE "EquipmentMaintenanceCompletion" ("id" TEXT NOT NULL, "equipmentId" TEXT NOT NULL, "completedById" TEXT NOT NULL, "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "notes" TEXT, CONSTRAINT "EquipmentMaintenanceCompletion_pkey" PRIMARY KEY ("id"));
CREATE INDEX "EquipmentMaintenanceCompletion_equipmentId_completedAt_idx" ON "EquipmentMaintenanceCompletion"("equipmentId", "completedAt");
ALTER TABLE "EquipmentMaintenanceCompletion" ADD CONSTRAINT "EquipmentMaintenanceCompletion_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentMaintenanceCompletion" ADD CONSTRAINT "EquipmentMaintenanceCompletion_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
