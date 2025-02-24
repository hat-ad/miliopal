-- CreateTable
CREATE TABLE "PrivateSeller" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateSeller_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PrivateSeller" ADD CONSTRAINT "PrivateSeller_id_fkey" FOREIGN KEY ("id") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
