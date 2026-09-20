-- AlterTable
ALTER TABLE "Class" ADD COLUMN "seriesId" TEXT;

-- CreateIndex
CREATE INDEX "Class_seriesId_idx" ON "Class"("seriesId");
