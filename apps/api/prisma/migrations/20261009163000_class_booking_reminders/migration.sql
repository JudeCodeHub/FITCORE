ALTER TABLE "Booking" ADD COLUMN "reminderSentAt" TIMESTAMP(3);
CREATE INDEX "Booking_status_reminderSentAt_idx" ON "Booking"("status", "reminderSentAt");
