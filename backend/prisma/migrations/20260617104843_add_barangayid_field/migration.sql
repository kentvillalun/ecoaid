/*
  Warnings:

  - Added the required column `barangayId` to the `StockTransactionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StockTransactionLog" ADD COLUMN     "barangayId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "StockTransactionLog" ADD CONSTRAINT "StockTransactionLog_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
