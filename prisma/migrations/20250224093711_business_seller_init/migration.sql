-- CreateTable
CREATE TABLE "BusinessSeller" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "organizationNumber" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSeller_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BusinessSeller" ADD CONSTRAINT "BusinessSeller_id_fkey" FOREIGN KEY ("id") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
