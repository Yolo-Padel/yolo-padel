/*
  Warnings:

  - You are about to drop the column `courtsideCourtId` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "courtsideCourtId",
ADD COLUMN     "courtsideBookingId" TEXT;
