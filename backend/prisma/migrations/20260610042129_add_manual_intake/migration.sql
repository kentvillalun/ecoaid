-- CreateTable
CREATE TABLE "ManualIntakeTransaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "collectorId" UUID NOT NULL,
    "barangayId" UUID NOT NULL,
    "householdName" TEXT,
    "collectorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualIntakeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualIntakeItems" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transactionId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'KG',

    CONSTRAINT "ManualIntakeItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ManualIntakeTransaction" ADD CONSTRAINT "ManualIntakeTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualIntakeTransaction" ADD CONSTRAINT "ManualIntakeTransaction_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualIntakeTransaction" ADD CONSTRAINT "ManualIntakeTransaction_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualIntakeItems" ADD CONSTRAINT "ManualIntakeItems_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "ManualIntakeTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualIntakeItems" ADD CONSTRAINT "ManualIntakeItems_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
