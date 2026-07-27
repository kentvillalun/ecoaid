/*
  Warnings:

  - Added the required column `pointCost` to the `RewardItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RedemptionTransaction" ADD COLUMN     "beneficiaryId" UUID;

-- AlterTable
ALTER TABLE "RewardItem" ADD COLUMN     "pointCost" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "RewardRelease" ADD COLUMN     "beneficiaryId" UUID;

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barangayId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RedemptionTransaction" ADD CONSTRAINT "RedemptionTransaction_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRelease" ADD CONSTRAINT "RewardRelease_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
