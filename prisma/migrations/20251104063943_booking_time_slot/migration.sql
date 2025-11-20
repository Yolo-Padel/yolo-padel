-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "bookingHour" DROP NOT NULL;

-- CreateTable
CREATE TABLE "booking_time_slots" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "openHour" TEXT NOT NULL,
    "closeHour" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_time_slots_bookingId_idx" ON "booking_time_slots"("bookingId");

-- AddForeignKey
ALTER TABLE "booking_time_slots" ADD CONSTRAINT "booking_time_slots_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
