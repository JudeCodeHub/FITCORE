CREATE TYPE "ComplaintType" AS ENUM ('COMPLAINT', 'SUGGESTION');

CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "type" "ComplaintType" NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Complaint_submittedById_idx" ON "Complaint"("submittedById");

CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
