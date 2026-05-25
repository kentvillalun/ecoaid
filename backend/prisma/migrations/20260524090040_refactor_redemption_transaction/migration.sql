/*
  Warnings:

  - You are about to drop the column `maxPoints` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `currentValue` on the `RedemptionTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `programMaterialId` on the `RedemptionTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `RedemptionTransaction` table. All the data in the column will be lost.
  - Added the required column `programId` to the `RedemptionTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RedemptionTransaction" DROP CONSTRAINT "RedemptionTransaction_programMaterialId_fkey";

-- AlterTable
ALTER TABLE "Program" DROP COLUMN "maxPoints";

-- AlterTable
ALTER TABLE "RedemptionTransaction" DROP COLUMN "currentValue",
DROP COLUMN "programMaterialId",
DROP COLUMN "quantity",
ADD COLUMN     "programId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "RedemptionTransactionItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transactionId" UUID NOT NULL,
    "programMaterialId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedemptionTransactionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RedemptionTransaction" ADD CONSTRAINT "RedemptionTransaction_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedemptionTransactionItem" ADD CONSTRAINT "RedemptionTransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "RedemptionTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedemptionTransactionItem" ADD CONSTRAINT "RedemptionTransactionItem_programMaterialId_fkey" FOREIGN KEY ("programMaterialId") REFERENCES "ProgramMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
