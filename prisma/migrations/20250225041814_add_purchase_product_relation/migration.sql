-- AddForeignKey
ALTER TABLE "ProductsPurchased" ADD CONSTRAINT "ProductsPurchased_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsPurchased" ADD CONSTRAINT "ProductsPurchased_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
