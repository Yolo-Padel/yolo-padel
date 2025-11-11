/*
  Warnings:

  - You are about to drop the column `assignedVenueId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_assignedVenueId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "assignedVenueId",
ADD COLUMN     "assignedVenueIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
