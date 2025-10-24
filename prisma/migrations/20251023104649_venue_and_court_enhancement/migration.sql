/*
  Warnings:

  - Added the required column `price` to the `courts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OpeningHoursType" AS ENUM ('REGULAR', 'WITHOUT_FIXED', 'TEMP_CLOSED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "courts" ADD COLUMN     "openingType" "OpeningHoursType" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "venues" ADD COLUMN     "city" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "address" DROP NOT NULL;

-- CreateTable
CREATE TABLE "venue_operating_hours" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "venue_operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_time_slots" (
    "id" TEXT NOT NULL,
    "venueOperatingHourId" TEXT NOT NULL,
    "openHour" TEXT NOT NULL,
    "closeHour" TEXT NOT NULL,

    CONSTRAINT "venue_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_operating_hours" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "court_operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_time_slots" (
    "id" TEXT NOT NULL,
    "courtOperatingHourId" TEXT NOT NULL,
    "openHour" TEXT NOT NULL,
    "closeHour" TEXT NOT NULL,

    CONSTRAINT "court_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "venue_operating_hours_venueId_dayOfWeek_key" ON "venue_operating_hours"("venueId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "court_operating_hours_courtId_dayOfWeek_key" ON "court_operating_hours"("courtId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "venue_operating_hours" ADD CONSTRAINT "venue_operating_hours_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_time_slots" ADD CONSTRAINT "venue_time_slots_venueOperatingHourId_fkey" FOREIGN KEY ("venueOperatingHourId") REFERENCES "venue_operating_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_operating_hours" ADD CONSTRAINT "court_operating_hours_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_time_slots" ADD CONSTRAINT "court_time_slots_courtOperatingHourId_fkey" FOREIGN KEY ("courtOperatingHourId") REFERENCES "court_operating_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
