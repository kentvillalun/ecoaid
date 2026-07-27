-- CreateEnum
CREATE TYPE "RewardCategory" AS ENUM ('MEDICINE', 'GOODS', 'SCHOOL_SUPPLIES', 'SERVICES', 'OTHERS');

-- CreateTable
CREATE TABLE "RewardItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "programId" UUID NOT NULL,
    "barangayId" UUID NOT NULL,
    "category" "RewardCategory" NOT NULL DEFAULT 'GOODS',
    "name" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardRelease" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rewardItemId" UUID NOT NULL,
    "userId" UUID,
    "programId" UUID NOT NULL,
    "barangayId" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "beneficiaryName" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardRelease_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RewardItem" ADD CONSTRAINT "RewardItem_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardItem" ADD CONSTRAINT "RewardItem_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRelease" ADD CONSTRAINT "RewardRelease_rewardItemId_fkey" FOREIGN KEY ("rewardItemId") REFERENCES "RewardItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRelease" ADD CONSTRAINT "RewardRelease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRelease" ADD CONSTRAINT "RewardRelease_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRelease" ADD CONSTRAINT "RewardRelease_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
