-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "ayoOrderIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
