-- AlterTable
ALTER TABLE "PickupRequests" ADD COLUMN     "photoMismatch" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "deactivatedById" UUID,
ADD COLUMN     "deactivatedByName" TEXT,
ADD COLUMN     "deactivatedByRole" TEXT,
ADD COLUMN     "reactivatedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_deactivatedById_fkey" FOREIGN KEY ("deactivatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
