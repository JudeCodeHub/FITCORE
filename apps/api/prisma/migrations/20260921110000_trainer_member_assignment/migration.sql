ALTER TABLE "User" ADD COLUMN "assignedTrainerId" TEXT;

CREATE INDEX "User_assignedTrainerId_idx" ON "User"("assignedTrainerId");

ALTER TABLE "User" ADD CONSTRAINT "User_assignedTrainerId_fkey" FOREIGN KEY ("assignedTrainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
