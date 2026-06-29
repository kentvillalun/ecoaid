-- CreateTable
CREATE TABLE "Junkshop" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "barangayId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Junkshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JunkshopPriceItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "junkshopId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'KG',

    CONSTRAINT "JunkshopPriceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JunkshopSale" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "junkshopId" UUID NOT NULL,
    "userId" UUID,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JunkshopSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JunkshopSaleItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "saleId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'KG',

    CONSTRAINT "JunkshopSaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JunkshopPriceItem_junkshopId_materialId_key" ON "JunkshopPriceItem"("junkshopId", "materialId");

-- AddForeignKey
ALTER TABLE "Junkshop" ADD CONSTRAINT "Junkshop_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkshopPriceItem" ADD CONSTRAINT "JunkshopPriceItem_junkshopId_fkey" FOREIGN KEY ("junkshopId") REFERENCES "Junkshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkshopPriceItem" ADD CONSTRAINT "JunkshopPriceItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkshopSale" ADD CONSTRAINT "JunkshopSale_junkshopId_fkey" FOREIGN KEY ("junkshopId") REFERENCES "Junkshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkshopSale" ADD CONSTRAINT "JunkshopSale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkshopSaleItem" ADD CONSTRAINT "JunkshopSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "JunkshopSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkshopSaleItem" ADD CONSTRAINT "JunkshopSaleItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
