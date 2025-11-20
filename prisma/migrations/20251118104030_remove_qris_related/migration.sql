/*
  Warnings:

  - You are about to drop the column `qrImageUrl` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `qrString` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `xenditPaymentRequestId` on the `payments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."payments_xenditPaymentRequestId_idx";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "qrImageUrl",
DROP COLUMN "qrString",
DROP COLUMN "xenditPaymentRequestId";
