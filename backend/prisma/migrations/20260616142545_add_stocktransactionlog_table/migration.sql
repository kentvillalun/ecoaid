-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('MANUAL_INTAKE', 'COLLECTION_REQUEST', 'MANUAL_ADJUSTMENT', 'REDEMPTION', 'JUNKSHOP_SALES');

-- CreateTable
CREATE TABLE "StockTransactionLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "materialId" UUID NOT NULL,
    "collectionRequestId" UUID,
    "manualIntakeTransactionId" UUID,
    "redemptionTransactionId" UUID,
    "junkshopSalesId" UUID,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'KG',
    "source" "Source" NOT NULL DEFAULT 'COLLECTION_REQUEST',
    "transactionType" "TransactionType" NOT NULL DEFAULT 'IN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransactionLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockTransactionLog" ADD CONSTRAINT "StockTransactionLog_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransactionLog" ADD CONSTRAINT "StockTransactionLog_collectionRequestId_fkey" FOREIGN KEY ("collectionRequestId") REFERENCES "PickupRequests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransactionLog" ADD CONSTRAINT "StockTransactionLog_manualIntakeTransactionId_fkey" FOREIGN KEY ("manualIntakeTransactionId") REFERENCES "ManualIntakeTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransactionLog" ADD CONSTRAINT "StockTransactionLog_redemptionTransactionId_fkey" FOREIGN KEY ("redemptionTransactionId") REFERENCES "RedemptionTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
