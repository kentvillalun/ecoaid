-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "allowDuplicates" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "RewardRelease" ADD COLUMN     "beneficiaryId" UUID;

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barangayId" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "residentId" UUID,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_programId_firstName_middleName_lastName_key" ON "Beneficiary"("programId", "firstName", "middleName", "lastName");

-- CreateIndex
CREATE INDEX "RewardRelease_beneficiaryId_idx" ON "RewardRelease"("beneficiaryId");

-- AddForeignKey
ALTER TABLE "RewardRelease" ADD CONSTRAINT "RewardRelease_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
