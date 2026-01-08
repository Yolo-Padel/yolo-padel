/*
  Warnings:

  - You are about to drop the column `courtsideCourtId` on the `courts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courts" DROP COLUMN "courtsideCourtId",
ADD COLUMN     "ayoFieldId" INTEGER;
