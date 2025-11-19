/*
  Warnings:

  - You are about to drop the `court_pricing_overrides` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."court_pricing_overrides" DROP CONSTRAINT "court_pricing_overrides_courtId_fkey";

-- DropTable
DROP TABLE "public"."court_pricing_overrides";

-- CreateTable
CREATE TABLE "court_dynamic_price" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek",
    "date" TIMESTAMP(3),
    "startHour" TEXT NOT NULL,
    "endHour" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "court_dynamic_price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "court_dynamic_price_courtId_dayOfWeek_date_idx" ON "court_dynamic_price"("courtId", "dayOfWeek", "date");

-- AddForeignKey
ALTER TABLE "court_dynamic_price" ADD CONSTRAINT "court_dynamic_price_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
