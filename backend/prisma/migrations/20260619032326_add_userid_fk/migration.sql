-- AlterTable
ALTER TABLE "StockTransactionLog" ADD COLUMN     "userId" UUID;

-- AddForeignKey
ALTER TABLE "StockTransactionLog" ADD CONSTRAINT "StockTransactionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
