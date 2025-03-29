/*
  Warnings:

  - You are about to alter the column `startingOrderNumber` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `currentOrderNumber` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `wallet` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `Purchase` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `Seller` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CashHistoryType" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('COMPANY', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "TodoListEvent" AS ENUM ('COMPANY_CASH_BALANCE_BELOW_THRESHOLD', 'INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD', 'INDIVIDUAL_CASH_BALANCE_ABOVE_THRESHOLD', 'PURCHASE_INITIATED_WITH_BANK_TRANSFER', 'ORDER_PICKUP_INITIATED');

-- CreateEnum
CREATE TYPE "TodoListStatus" AS ENUM ('DONE', 'PENDING');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Seller" DROP CONSTRAINT "Seller_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- DropIndex
DROP INDEX "Purchase_orderNo_key";

-- AlterTable
ALTER TABLE "BusinessSeller" ALTER COLUMN "organizationNumber" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "wallet" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "organizationNumber" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "totalAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transactionDate" TIMESTAMP(3),
ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Receipt" ALTER COLUMN "startingOrderNumber" SET DATA TYPE INTEGER,
ALTER COLUMN "currentOrderNumber" SET DATA TYPE INTEGER,
ALTER COLUMN "logo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastReconciled" TIMESTAMP(3),
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3),
ADD COLUMN     "wallet" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateTable
CREATE TABLE "ProductForDelivery" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "pickUpDeliveryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductForDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickUpDelivery" (
    "id" TEXT NOT NULL,
    "PONumber" TEXT,
    "comment" TEXT,
    "sellerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickUpDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashHistory" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "type" "CashHistoryType" NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actionBy" TEXT NOT NULL,
    "actionTo" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationHistory" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "reConciliatedBy" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "expectedAmount" DOUBLE PRECISION NOT NULL,
    "amountCounted" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "reconciliationStartTime" TIMESTAMP(3) NOT NULL,
    "reconciliationEndTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoList" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "event" "TodoListEvent" NOT NULL,
    "status" "TodoListStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TodoList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoListSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "companyCashBalanceLowerThreshold" DOUBLE PRECISION,
    "individualCashBalanceLowerThreshold" DOUBLE PRECISION,
    "individualCashBalanceUpperThreshold" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TodoListSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TodoListSettings_organizationId_key" ON "TodoListSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerInvite_email_key" ON "SellerInvite"("email");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductForDelivery" ADD CONSTRAINT "ProductForDelivery_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductForDelivery" ADD CONSTRAINT "ProductForDelivery_pickUpDeliveryId_fkey" FOREIGN KEY ("pickUpDeliveryId") REFERENCES "PickUpDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickUpDelivery" ADD CONSTRAINT "PickUpDelivery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickUpDelivery" ADD CONSTRAINT "PickUpDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickUpDelivery" ADD CONSTRAINT "PickUpDelivery_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashHistory" ADD CONSTRAINT "CashHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashHistory" ADD CONSTRAINT "CashHistory_actionBy_fkey" FOREIGN KEY ("actionBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashHistory" ADD CONSTRAINT "CashHistory_actionTo_fkey" FOREIGN KEY ("actionTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationHistory" ADD CONSTRAINT "ReconciliationHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationHistory" ADD CONSTRAINT "ReconciliationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationHistory" ADD CONSTRAINT "ReconciliationHistory_reConciliatedBy_fkey" FOREIGN KEY ("reConciliatedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoListSettings" ADD CONSTRAINT "TodoListSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
