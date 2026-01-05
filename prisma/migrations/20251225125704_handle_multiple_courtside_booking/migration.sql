/*
  Warnings:

  - The `courtsideBookingId` column on the `bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "courtsideBookingId",
ADD COLUMN     "courtsideBookingId" TEXT[] DEFAULT ARRAY[]::TEXT[];
