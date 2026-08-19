-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeenAnnouncementAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "pickupRequestId" UUID,
    "type" "Status" NOT NULL DEFAULT 'REQUESTED',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_pickupRequestId_fkey" FOREIGN KEY ("pickupRequestId") REFERENCES "PickupRequests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
