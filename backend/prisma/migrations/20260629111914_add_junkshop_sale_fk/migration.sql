-- AddForeignKey
ALTER TABLE "StockTransactionLog" ADD CONSTRAINT "StockTransactionLog_junkshopSalesId_fkey" FOREIGN KEY ("junkshopSalesId") REFERENCES "JunkshopSale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
