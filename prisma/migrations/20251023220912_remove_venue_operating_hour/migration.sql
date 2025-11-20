/*
  Warnings:

  - You are about to drop the `venue_operating_hours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `venue_time_slots` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `closeHour` to the `venues` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openHour` to the `venues` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."venue_operating_hours" DROP CONSTRAINT "venue_operating_hours_venueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."venue_time_slots" DROP CONSTRAINT "venue_time_slots_venueOperatingHourId_fkey";

-- AlterTable
ALTER TABLE "venues" ADD COLUMN     "closeHour" TEXT NOT NULL,
ADD COLUMN     "openHour" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."venue_operating_hours";

-- DropTable
DROP TABLE "public"."venue_time_slots";
