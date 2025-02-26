/*
  Warnings:

  - You are about to alter the column `price` on the `ProductsPurchased` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "ProductsPurchased" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;
