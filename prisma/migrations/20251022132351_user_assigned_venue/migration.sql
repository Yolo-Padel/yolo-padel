-- AlterTable
ALTER TABLE "users" ADD COLUMN     "assignedVenueId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_assignedVenueId_fkey" FOREIGN KEY ("assignedVenueId") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
