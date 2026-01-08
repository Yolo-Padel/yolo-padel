/*
  Warnings:

  - You are about to drop the column `courtsideBookingId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `courtsideApiKey` on the `venues` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "courtsideBookingId";

-- AlterTable
ALTER TABLE "venues" DROP COLUMN "courtsideApiKey";
