-- CreateTable
CREATE TABLE "court_pricing_overrides" (
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

    CONSTRAINT "court_pricing_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "court_pricing_overrides_courtId_dayOfWeek_date_idx" ON "court_pricing_overrides"("courtId", "dayOfWeek", "date");

-- AddForeignKey
ALTER TABLE "court_pricing_overrides" ADD CONSTRAINT "court_pricing_overrides_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
