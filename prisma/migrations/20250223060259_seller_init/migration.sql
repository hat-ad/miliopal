-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('PRIVATE', 'BUSINESS');

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" "SellerType" NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "companyName" TEXT,
    "contactPerson" TEXT,
    "organizationNumber" DOUBLE PRECISION,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");
