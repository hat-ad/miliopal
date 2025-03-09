/*
  Warnings:

  - You are about to alter the column `organizationNumber` on the `BusinessSeller` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `organizationNumber` on the `Organization` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "BusinessSeller" ALTER COLUMN "organizationNumber" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "organizationNumber" SET DATA TYPE INTEGER;
