/*
  Warnings:

  - You are about to drop the column `beneficiaryId` on the `RedemptionTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `educationalLevel` on the `RedemptionTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `beneficiaryId` on the `RewardRelease` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RewardRelease` table. All the data in the column will be lost.
  - You are about to drop the `Beneficiary` table. If the table is not empty, all the data it contains will be lost.
  - `beneficiaryName` is renamed to `residentName` on `RedemptionTransaction` and `RewardRelease` (hand-edited so the existing values are kept).

*/
-- DropForeignKey
ALTER TABLE "Beneficiary" DROP CONSTRAINT "Beneficiary_barangayId_fkey";

-- DropForeignKey
ALTER TABLE "RedemptionTransaction" DROP CONSTRAINT "RedemptionTransaction_beneficiaryId_fkey";

-- DropForeignKey
ALTER TABLE "RewardRelease" DROP CONSTRAINT "RewardRelease_beneficiaryId_fkey";

-- DropForeignKey
ALTER TABLE "RewardRelease" DROP CONSTRAINT "RewardRelease_userId_fkey";

-- RenameColumn
ALTER TABLE "RedemptionTransaction" RENAME COLUMN "beneficiaryName" TO "residentName";

-- AlterTable
ALTER TABLE "RedemptionTransaction" DROP COLUMN "beneficiaryId",
DROP COLUMN "educationalLevel",
ADD COLUMN     "residentId" UUID;

-- RenameColumn
ALTER TABLE "RewardRelease" RENAME COLUMN "beneficiaryName" TO "residentName";

-- AlterTable
ALTER TABLE "RewardRelease" DROP COLUMN "beneficiaryId",
DROP COLUMN "userId",
ADD COLUMN     "residentId" UUID;

-- DropTable
DROP TABLE "Beneficiary";

-- DropEnum
DROP TYPE "EducationalLevel";

-- CreateIndex
CREATE INDEX "RedemptionTransaction_residentId_programId_idx" ON "RedemptionTransaction"("residentId", "programId");

-- CreateIndex
CREATE INDEX "RewardRelease_residentId_programId_idx" ON "RewardRelease"("residentId", "programId");

-- AddForeignKey
ALTER TABLE "RedemptionTransaction" ADD CONSTRAINT "RedemptionTransaction_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRelease" ADD CONSTRAINT "RewardRelease_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
