/*
  Warnings:

  - The values [ACTIVE,INACTIVE] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('JOINED', 'INVITED');
ALTER TABLE "public"."users" ALTER COLUMN "userStatus" DROP DEFAULT;

-- Convert to text first, then map old values to new values, then cast to new enum
ALTER TABLE "users" ALTER COLUMN "userStatus" TYPE "UserStatus_new" 
  USING (
    CASE "userStatus"::text
      WHEN 'ACTIVE' THEN 'JOINED'
      WHEN 'INACTIVE' THEN 'INVITED'
      ELSE "userStatus"::text
    END
  )::"UserStatus_new";

ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "userStatus" SET DEFAULT 'JOINED';
COMMIT;

-- DropIndex
DROP INDEX "idx_users_assigned_venue_ids";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "venueIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "userStatus" SET DEFAULT 'JOINED';

-- CreateIndex
CREATE INDEX "orders_venueIds_idx" ON "orders"("venueIds");

-- CreateIndex
CREATE INDEX "users_assignedVenueIds_idx" ON "users"("assignedVenueIds");

-- RenameIndex
ALTER INDEX "idx_profiles_full_name" RENAME TO "profiles_fullName_idx";

-- RenameIndex
ALTER INDEX "idx_users_user_status" RENAME TO "users_userStatus_idx";

-- RenameIndex
ALTER INDEX "idx_users_user_type" RENAME TO "users_userType_idx";
